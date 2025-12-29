import { redirect } from "next/navigation";

import { getCurrentSession } from "@/core/usecases/auth/getCurrentSession";

import { createAuthRepository } from "@/infrastructure/supabase/repositories";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";

/**
 * Server-side layout for landing page.
 * Checks if user is authenticated and redirects to /workspace if session exists.
 * If no session, shows landing page.
 */
export default async function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    // Create server client with cookie handling
    const supabaseClient = await createSupabaseServerClient();
    const authRepository = createAuthRepository(supabaseClient);

    // Check if user is authenticated
    const session = await getCurrentSession(authRepository);

    // If authenticated, redirect to workspace
    if (session) {
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

    // On error, show landing page (fail-open for public route)
    // User can still access landing even if auth check fails
    console.error("[LandingLayout] Auth check error:", error);
  }

  // No session, show landing page
  return <>{children}</>;
}

