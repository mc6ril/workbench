import { cookies } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import {
  APP_COOKIE_KEYS,
  getCookie,
} from "@/shared/infrastructure/storage/cookies";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { createBillingVisibilityPort } from "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase";
import { queryKeys as billingQueryKeys } from "@/domains/billing/presentation/hooks/queryKeys";
import {
  getRuntimeConfigBooleanOverride,
  getRuntimeConfigEvaluationCacheTag,
  readRuntimeConfigBooleanOverridesFromCookieValue,
} from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";
import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
import { listReclaimableProjects } from "@/domains/workspace/core/usecases/project/listReclaimableProjects";
import { createWorkspaceProjectCatalogGateway } from "@/domains/workspace/infrastructure/supabase/gateways";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";
import WorkspacePage from "@/domains/workspace/presentation/pages/workspace";

const WorkspaceRoutePage = async () => {
  const queryClient = createAppQueryClient();
  const supabaseClient = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const workspaceProjectCatalogGateway =
    createWorkspaceProjectCatalogGateway(supabaseClient);
  const billingVisibilityPort = createBillingVisibilityPort(supabaseClient);
  const runtimeConfigOverrides =
    readRuntimeConfigBooleanOverridesFromCookieValue(
      getCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES, cookieStore)
    );
  const billingOverride = getRuntimeConfigBooleanOverride(
    runtimeConfigOverrides,
    "is_billing_visible"
  );
  const billingEvaluationTag = getRuntimeConfigEvaluationCacheTag({
    overrideValue: billingOverride,
  });

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: workspaceQueryKeys.projects.withStats(),
      queryFn: () => listProjectsWithStats(workspaceProjectCatalogGateway),
    }),
    queryClient.prefetchQuery({
      queryKey: workspaceQueryKeys.projects.reclaimable(),
      queryFn: () => listReclaimableProjects(workspaceProjectCatalogGateway),
    }),
    queryClient.prefetchQuery({
      queryKey: billingQueryKeys.config.billingVisibility(billingEvaluationTag),
      queryFn: () =>
        getBillingVisibility(billingVisibilityPort, {
          overrideValue: billingOverride,
        }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkspacePage referenceTimeIso={new Date().toISOString()} />
    </HydrationBoundary>
  );
};

export default WorkspaceRoutePage;
