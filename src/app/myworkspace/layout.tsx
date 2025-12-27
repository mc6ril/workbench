import { redirect } from "next/navigation";

import { getCurrentSession } from "@/core/usecases/auth/getCurrentSession";

import { createAuthRepository } from "@/infrastructure/supabase/repositories";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";

/**
 * Server-side layout for /myworkspace route.
 * Checks authentication (middleware already verified this, but double-check).
 * Users can access /myworkspace even without projects - the page will show
 * create/access project forms.
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

    // Load session using server client (reads from cookies)
    const session = await getCurrentSession(authRepository);

    // If no session, redirect to signin
    if (!session) {
      redirect("/auth/signin");
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

  // User is authenticated, render children
  // Note: User can access /myworkspace even without projects
  // The page will show create/access project forms
  return <>{children}</>;
}
