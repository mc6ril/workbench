import { redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";
import { isDynamicServerUsageError } from "@/shared/utils/nextErrors";

import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionRepository } from "@/domains/session/infrastructure/supabase/repositories";

const logger = createLoggerFactory().forScope("AuthLayout");

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
    const sessionRepository = createSessionRepository(supabaseClient);

    // Load session using server client (throws NotFoundError if no session)
    // If user not authenticated, NotFoundError is thrown and caught below
    await getCurrentSession(sessionRepository);
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

    // On any other error, fail-closed: redirect to landing
    // This prevents lockout but ensures security
    logger.error("Authentication error", { error });
    redirect(PAGE_ROUTES.HOME);
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default AuthLayout;
