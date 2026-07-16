import { notFound, redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { isNotFoundError as isRepositoryNotFoundError } from "@/shared/errors/repositoryError.guards";
import {
  isDynamicServerUsageError,
  isNotFoundError,
} from "@/shared/utils/nextErrors";

import { loadProjectShellData } from "@/domains/project/infrastructure/server/loadProjectShellData";
import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";

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

    // Repository NotFoundError means the project doesn't exist or is
    // inaccessible (e.g. RLS blocks it). Show 404 rather than silently
    // redirecting to workspace.
    if (isRepositoryNotFoundError(error)) {
      notFound();
    }

    console.error("Project access check error", { error });
    redirect(PAGE_ROUTES.WORKSPACE);
  }

  return (
    <ProjectShell projectId={projectId} shellSnapshot={shellSnapshot}>
      {children}
    </ProjectShell>
  );
};

export default ProjectRouteLayoutContent;
