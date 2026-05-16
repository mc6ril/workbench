import { redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createLoggerFactory } from "@/shared/observability";
import {
  isDynamicServerUsageError,
  isNotFoundError,
} from "@/shared/utils/nextErrors";

import { loadProjectShellData } from "@/domains/project/infrastructure/server/loadProjectShellData";
import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";

const logger = createLoggerFactory().forScope("ProjectRouteLayoutContent");

type Props = Readonly<{
  children: React.ReactNode;
  projectId: string;
}>;

const ProjectRouteLayoutContent = async ({ children, projectId }: Props) => {
  let shellSnapshot;

  try {
    shellSnapshot = await loadProjectShellData(projectId);
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

    if (isDynamicServerUsageError(error) || isNotFoundError(error)) {
      throw error;
    }

    logger.error("Project access check error", { error });
    redirect(PAGE_ROUTES.WORKSPACE);
  }

  return (
    <ProjectShell projectId={projectId} shellSnapshot={shellSnapshot}>
      {children}
    </ProjectShell>
  );
};

export default ProjectRouteLayoutContent;
