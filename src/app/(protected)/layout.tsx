import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { dehydrate } from "@tanstack/react-query";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";
import AppProvider from "@/shared/providers/AppProvider";
import { createAppQueryClient } from "@/shared/providers/queryClient";
import { noIndexMetadata } from "@/shared/seo/noIndexMetadata";
import { isDynamicServerUsageError } from "@/shared/utils/nextErrors";

import { getProfile } from "@/domains/profile/core/usecases/getProfile";
import { createProfileGateway } from "@/domains/profile/infrastructure/profileGateway.supabase";
import { queryKeys as profileQueryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";
import { queryKeys as sessionQueryKeys } from "@/domains/session/presentation/hooks/queryKeys";

export const metadata: Metadata = noIndexMetadata;

const logger = createLoggerFactory().forScope("ProtectedLayout");

/**
 * Server-side layout for authenticated routes in the `(protected)` route group.
 * Checks authentication and redirects to landing page if no session or on error (fail-closed).
 * It also hydrates session/profile queries to avoid a second client-side auth bootstrap.
 */
const ProtectedLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const queryClient = createAppQueryClient();

  try {
    // Create server client with cookie handling
    const supabaseClient = await createSupabaseServerClient();
    const sessionGateway = createSessionGateway(supabaseClient);
    const profileGateway = createProfileGateway(supabaseClient);

    // Load session using server client (throws NotFoundError if no session)
    // If user not authenticated, NotFoundError is thrown and caught below
    const session = await getCurrentSession(sessionGateway);

    queryClient.setQueryData(sessionQueryKeys.session.current(), session);

    await queryClient
      .prefetchQuery({
        queryKey: profileQueryKeys.userProfiles.detail(session.userId),
        queryFn: () => getProfile(profileGateway, session.userId),
      })
      .catch((error: unknown) => {
        logger.warn("Profile prefetch failed", { error, userId: session.userId });
      });
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
  return (
    <AppProvider dehydratedState={dehydrate(queryClient)}>
      {children}
    </AppProvider>
  );
};

export default ProtectedLayout;
