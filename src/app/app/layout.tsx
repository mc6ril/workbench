import { redirect } from "next/navigation";

import { getCurrentSession } from "@/core/usecases/auth/getCurrentSession";
import { hasProjectAccess } from "@/core/usecases/project/hasProjectAccess";

import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";
import {
  createAuthRepository,
  createProjectRepository,
} from "@/infrastructure/supabase/repositories";

/**
 * Server-side layout for /app/* routes.
 * Checks authentication (middleware already verified this, but double-check)
 * and project access, redirecting to workspace page if user has no projects.
 */
export default async function AppLayout({
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

    // If no session, redirect to signin (middleware should have caught this, but fail-safe)
    if (!session) {
      redirect("/signin");
    }

    // Check project access using optimized usecase
    const userHasProjects = await hasProjectAccess(projectRepository);

    // If user has no projects, redirect to workspace page
    if (!userHasProjects) {
      redirect("/myworkspace");
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
    console.error("App layout error:", error);
  }

  // User is authenticated and has projects, render children
  return <>{children}</>;
}

