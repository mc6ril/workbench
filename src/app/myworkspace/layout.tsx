import { redirect } from "next/navigation";

import { getCurrentSession } from "@/core/usecases/auth/getCurrentSession";
import { hasProjectAccess } from "@/core/usecases/project/hasProjectAccess";

import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";
import {
  createAuthRepository,
  createProjectRepository,
} from "@/infrastructure/supabase/repositories";

/**
 * Server-side layout for /myworkspace route.
 * Checks authentication (middleware already verified this, but double-check)
 * and project access, redirecting to home page if user has no projects.
 */
export default async function MyWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    // Create server client with cookie handling
    const supabaseClient = await createSupabaseServerClient();
    const authRepository = createAuthRepository(supabaseClient);
    const projectRepository = createProjectRepository(supabaseClient);

    // Load session using server client (reads from cookies)
    const session = await getCurrentSession(authRepository);

    // If no session, redirect to landing page
    if (!session) {
      redirect("/");
    }

    // Check project access using optimized usecase
    const userHasProjects = await hasProjectAccess(projectRepository);

    // If user has no projects, redirect to home page
    if (!userHasProjects) {
      redirect("/");
    }
  } catch (error) {
    // Next.js redirect() throws a special error that must be re-thrown
    // Check if this is a redirect error by checking the digest
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      // Re-throw redirect errors to allow Next.js to handle them
      throw error;
    }

    // On other errors, fail open (allow access) to prevent lockout
    // RLS policies will still protect data at database level
    console.error("MyWorkspace layout error:", error);
  }

  // User is authenticated and has projects, render children
  return <>{children}</>;
}
