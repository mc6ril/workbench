import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { APP_COOKIE_KEYS, getCookie } from "@/shared/infrastructure/storage/cookies";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";
import { createAppQueryClient } from "@/shared/providers/queryClient";
import { isDynamicServerUsageError } from "@/shared/utils/nextErrors";

import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { getUserSubscription } from "@/domains/billing/core/usecases/getUserSubscription";
import { createBillingVisibilityPort } from "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase";
import { createSubscriptionRepository } from "@/domains/billing/infrastructure/supabase/SubscriptionRepository.supabase";
import { queryKeys as billingQueryKeys } from "@/domains/billing/presentation/hooks/queryKeys";
import { getCurrentProjectRole } from "@/domains/project/core/usecases/member/getCurrentProjectRole";
import { listProjectMembers } from "@/domains/project/core/usecases/member/listProjectMembers";
import { getProjectForRoute } from "@/domains/project/infrastructure/server/getProjectForRoute";
import { createProjectMemberGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys as projectQueryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";
import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";
import {
  getRuntimeConfigBooleanOverride,
  getRuntimeConfigEvaluationCacheTag,
  readRuntimeConfigBooleanOverridesFromCookieValue,
} from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";
import { createRuntimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/RuntimeConfigPort.supabase";
import { queryKeys as runtimeConfigQueryKeys } from "@/domains/runtimeConfig/presentation/hooks/queryKeys";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/SessionGateway.supabase";
import BoardShellAdapter from "@/modules/board/presentation/projectShell/boardShellAdapter";
import RecipesShellAdapter from "@/modules/recipes/presentation/projectShell/recipesShellAdapter";

const logger = createLoggerFactory().forScope("ProjectLayout");

/**
 * Server-side layout for project routes.
 * Checks project access using getProject usecase (respects RLS).
 * If user has no access (returns null), redirects to /workspace.
 * This layout does NOT pass project data to children - all data fetching happens in client pages.
 */
const ProjectLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}>) => {
  const { projectId } = await params;

  try {
    // If project not found or user has no access (per RLS), NotFoundError is thrown.
    // This loader is shared with the segment page and deduplicated per request.
    await getProjectForRoute(projectId);
  } catch (error) {
    // Next.js redirect() throws a special error that must be re-thrown
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    // On any other error, redirect to workspace (fail-closed for security)
    logger.error("Project access check error", { error });
    redirect(PAGE_ROUTES.WORKSPACE);
  }

  const queryClient = createAppQueryClient();
  const supabaseClient = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const projectMemberGateway = createProjectMemberGateway(supabaseClient);
  const billingVisibilityPort = createBillingVisibilityPort(supabaseClient);
  const runtimeConfigPort = createRuntimeConfigPort(supabaseClient);
  const sessionGateway = createSessionGateway(supabaseClient);
  const session = await sessionGateway.getCurrentSession();
  const runtimeConfigOverrides = readRuntimeConfigBooleanOverridesFromCookieValue(
    getCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES, cookieStore)
  );
  const billingOverride = getRuntimeConfigBooleanOverride(
    runtimeConfigOverrides,
    "is_billing_visible"
  );
  const recipesBoardOverride = getRuntimeConfigBooleanOverride(
    runtimeConfigOverrides,
    "is_recipes_board_visible"
  );
  const billingEvaluationTag = getRuntimeConfigEvaluationCacheTag({
    overrideValue: billingOverride,
  });
  const recipesBoardEvaluationTag = getRuntimeConfigEvaluationCacheTag({
    overrideValue: recipesBoardOverride,
  });

  const prefetches = [
    queryClient.prefetchQuery({
      queryKey: projectQueryKeys.projects.currentRole(projectId),
      queryFn: () => getCurrentProjectRole(projectMemberGateway, projectId),
    }),
    queryClient.prefetchQuery({
      queryKey: projectQueryKeys.members.byProject(projectId),
      queryFn: () => listProjectMembers(projectMemberGateway, projectId),
    }),
    queryClient.prefetchQuery({
      queryKey: billingQueryKeys.config.billingVisibility(billingEvaluationTag),
      queryFn: () =>
        getBillingVisibility(billingVisibilityPort, {
          overrideValue: billingOverride,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: runtimeConfigQueryKeys.runtimeConfig.boolean(
        "is_recipes_board_visible",
        recipesBoardEvaluationTag
      ),
      queryFn: () =>
        getRuntimeConfigBoolean(runtimeConfigPort, {
          key: "is_recipes_board_visible",
          defaultValue: false,
          overrideValue: recipesBoardOverride,
        }),
    }),
  ];

  if (session?.userId) {
    const subscriptionRepository = createSubscriptionRepository(
      supabaseClient,
      supabaseClient
    );

    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: billingQueryKeys.subscription.current(),
        queryFn: () =>
          getUserSubscription(subscriptionRepository, {
            userId: session.userId,
            isSuperuser: session.isSuperuser,
          }),
      })
    );
  }

  await Promise.all(prefetches);

  // User has access, render children
  // Note: We don't pass project data here - client pages fetch via React Query
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectShell
        projectId={projectId}
        shellAdapter={
          <>
            <BoardShellAdapter projectId={projectId} />
            <RecipesShellAdapter projectId={projectId} />
          </>
        }
      >
        {children}
      </ProjectShell>
    </HydrationBoundary>
  );
};

export default ProjectLayout;
