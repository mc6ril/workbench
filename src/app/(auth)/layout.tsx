import { redirect } from "next/navigation";

import { getCurrentSession } from "@/core/usecases/auth/getCurrentSession";

import { createAuthRepository } from "@/infrastructure/supabase/repositories";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";

/**
 * Server-side layout for all protected routes under (auth) route group.
 * Checks authentication and redirects to landing page if no session or on error (fail-closed).
 * This layout does NOT pass data to children - all data fetching happens in client pages.
 */
const AuthLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  try {
    // Create server client with cookie handling
    const supabaseClient = await createSupabaseServerClient();
    const authRepository = createAuthRepository(supabaseClient);

    // Load session using server client (reads from cookies)
    const session = await getCurrentSession(authRepository);

    // If no session, redirect to landing (fail-closed)
    if (!session) {
      redirect("/");
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

    // On any other error, fail-closed: redirect to landing
    // This prevents lockout but ensures security
    console.error("[AuthLayout] Authentication error:", error);
    redirect("/");
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default AuthLayout;
