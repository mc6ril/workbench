import { redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createLoggerFactory } from "@/shared/observability";
import { isDynamicServerUsageError } from "@/shared/utils/nextErrors";

import { getProjectForRoute } from "./getProjectForRoute";

import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";

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

  // User has access, render children
  // Note: We don't pass project data here - client pages fetch via React Query
  return <ProjectShell projectId={projectId}>{children}</ProjectShell>;
};

export default ProjectLayout;
