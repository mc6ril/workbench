import { redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createLoggerFactory } from "@/shared/observability";
import { isDynamicServerUsageError } from "@/shared/utils/nextErrors";

import { getProjectShellSnapshot } from "@/domains/project/infrastructure/server/getProjectShellSnapshot";
import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";
import BoardShellAdapter from "@/modules/board/presentation/projectShell/boardShellAdapter";
import RecipesShellAdapter from "@/modules/recipes/presentation/projectShell/recipesShellAdapter";

const logger = createLoggerFactory().forScope("ProjectLayout");

/**
 * Server-side layout for project routes.
 * Resolves minimal shell snapshot (access + enabled modules + recipes visibility flag).
 * Does not prefetch role, members, billing, or subscription.
 */
const ProjectLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}>) => {
  const { projectId } = await params;

  let shellSnapshot;

  try {
    shellSnapshot = await getProjectShellSnapshot(projectId);
  } catch (error) {
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

    logger.error("Project access check error", { error });
    redirect(PAGE_ROUTES.WORKSPACE);
  }

  return (
    <ProjectShell
      projectId={projectId}
      shellSnapshot={shellSnapshot}
      shellAdapter={
        <>
          <BoardShellAdapter projectId={projectId} />
          <RecipesShellAdapter projectId={projectId} />
        </>
      }
    >
      {children}
    </ProjectShell>
  );
};

export default ProjectLayout;
