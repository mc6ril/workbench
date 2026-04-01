import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";
import RequestLocaleAppProviders from "@/shared/providers/RequestLocaleAppProviders";
import { noIndexMetadata } from "@/shared/seo/noIndexMetadata";
import { isDynamicServerUsageError } from "@/shared/utils/nextErrors";

import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";

export const metadata: Metadata = noIndexMetadata;

const logger = createLoggerFactory().forScope("ProtectedLayout");

/**
 * Server-side layout for authenticated routes in the `(protected)` route group.
 * Checks authentication and redirects to landing page if no session or on error (fail-closed).
 * This layout does NOT pass data to children - all data fetching happens in client pages.
 */
const ProtectedLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  try {
    // Create server client with cookie handling
    const supabaseClient = await createSupabaseServerClient();
    const sessionGateway = createSessionGateway(supabaseClient);

    // Load session using server client (throws NotFoundError if no session)
    // If user not authenticated, NotFoundError is thrown and caught below
    await getCurrentSession(sessionGateway);
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
  return <RequestLocaleAppProviders>{children}</RequestLocaleAppProviders>;
};

export default ProtectedLayout;
