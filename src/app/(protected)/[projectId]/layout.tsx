import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";
import { createAppQueryClient } from "@/shared/providers/queryClient";
import { isDynamicServerUsageError } from "@/shared/utils/nextErrors";

import { getCurrentProjectRole } from "@/domains/project/core/usecases/member/getCurrentProjectRole";
import { listProjectMembers } from "@/domains/project/core/usecases/member/listProjectMembers";
import { getProjectForRoute } from "@/domains/project/infrastructure/server/getProjectForRoute";
import { createProjectMemberGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys as projectQueryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";
import { getProjectShortCode } from "@/modules/board/core/usecases/project/getProjectShortCode";
import { createProjectLookupRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys as boardQueryKeys } from "@/modules/board/presentation/hooks/queryKeys";
import BoardShellAdapter from "@/modules/board/presentation/projectShell/boardShellAdapter";

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
  const projectMemberGateway = createProjectMemberGateway(supabaseClient);
  const projectLookupRepository = createProjectLookupRepository(supabaseClient);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: projectQueryKeys.projects.currentRole(projectId),
      queryFn: () => getCurrentProjectRole(projectMemberGateway, projectId),
    }),
    queryClient.prefetchQuery({
      queryKey: projectQueryKeys.members.byProject(projectId),
      queryFn: () => listProjectMembers(projectMemberGateway, projectId),
    }),
    queryClient.prefetchQuery({
      queryKey: boardQueryKeys.projects.shortCode(projectId),
      queryFn: () => getProjectShortCode(projectLookupRepository, projectId),
    }),
  ]);

  // User has access, render children
  // Note: We don't pass project data here - client pages fetch via React Query
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectShell
        projectId={projectId}
        shellAdapter={<BoardShellAdapter projectId={projectId} />}
      >
        {children}
      </ProjectShell>
    </HydrationBoundary>
  );
};

export default ProjectLayout;
