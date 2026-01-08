import { redirect } from "next/navigation";

import { getProject } from "@/core/usecases/project/getProject";

import { createProjectRepository } from "@/infrastructure/supabase/repositories";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";

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
    // Create server client with cookie handling
    const supabaseClient = await createSupabaseServerClient();
    const projectRepository = createProjectRepository(supabaseClient);

    // Check project access using getProject (RLS will filter if no access)
    const project = await getProject(projectRepository, projectId);

    // If project is null, user has no access (per RLS), redirect to workspace
    if (!project) {
      redirect("/workspace");
    }
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

    // On any other error, redirect to workspace (fail-closed for security)
    console.error("[ProjectLayout] Project access check error:", error);
    redirect("/workspace");
  }

  // User has access, render children
  // Note: We don't pass project data here - client pages fetch via React Query
  return <>{children}</>;
};

export default ProjectLayout;
