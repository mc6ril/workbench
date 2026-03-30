import { redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { isNotFoundError } from "@/shared/errors/repositoryError.guards";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";
import { isDynamicServerUsageError } from "@/shared/utils/nextErrors";

import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";

const logger = createLoggerFactory().forScope("LandingLayout");

/**
 * Server-side layout for landing page.
 * Checks if user is authenticated and redirects to /workspace if session exists.
 * If no session, shows landing page.
 */
const LandingLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  try {
    // Create server client with cookie handling
    const supabaseClient = await createSupabaseServerClient();
    const sessionGateway = createSessionGateway(supabaseClient);

    // Check if user is authenticated (throws NotFoundError if no session)
    // If authenticated, redirect to workspace
    await getCurrentSession(sessionGateway);
    redirect(PAGE_ROUTES.WORKSPACE);
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

    // On NotFoundError (no session), show landing page (fail-open for public route)
    // NotFoundError is normal on public pages - don't log it
    // On other errors, also show landing page (fail-open) but log them
    if (!isNotFoundError(error)) {
      logger.error("Auth check error", { error });
    }
  }

  // No session, show landing page
  return <>{children}</>;
};

export default LandingLayout;
