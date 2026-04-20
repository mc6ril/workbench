import type { Metadata } from "next";
import { dehydrate } from "@tanstack/react-query";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";
import AppProvider from "@/shared/providers/AppProvider";
import { createAppQueryClient } from "@/shared/providers/queryClient";
import RequestIntlProvider from "@/shared/providers/RequestIntlProvider";
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
 * Authentication is enforced in `middleware.ts` (Edge) and ultimately by database RLS.
 * This layout only performs best-effort hydration of session/profile queries to avoid a second
 * client-side bootstrap when a session is available.
 */
const ProtectedLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const queryClient = createAppQueryClient();

  try {
    const supabaseClient = await createSupabaseServerClient();
    const sessionGateway = createSessionGateway(supabaseClient);
    const profileGateway = createProfileGateway(supabaseClient);

    const session = await getCurrentSession(sessionGateway);

    queryClient.setQueryData(sessionQueryKeys.session.current(), session);

    await queryClient
      .prefetchQuery({
        queryKey: profileQueryKeys.userProfiles.detail(session.userId),
        queryFn: () => getProfile(profileGateway, session.userId),
      })
      .catch((error: unknown) => {
        logger.warn("Profile prefetch failed", {
          error,
          userId: session.userId,
        });
      });
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    // Best-effort: if hydration fails (no session, transient error, etc.), still render children.
    logger.warn("Session hydration skipped", { error });
  }

  return (
    <RequestIntlProvider>
      <AppProvider dehydratedState={dehydrate(queryClient)}>
        {children}
      </AppProvider>
    </RequestIntlProvider>
  );
};

export default ProtectedLayout;
