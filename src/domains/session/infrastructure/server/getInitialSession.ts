import { headers } from "next/headers";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import {
  decodeSessionHeader,
  SESSION_HEADER_NAME,
} from "@/domains/session/infrastructure/sessionHeader";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/SessionGateway.supabase";

export const getInitialSession = async (): Promise<CurrentSession | null> => {
  const headerStore = await headers();
  const forwardedSession = decodeSessionHeader(
    headerStore.get(SESSION_HEADER_NAME)
  );

  if (forwardedSession) {
    return forwardedSession;
  }

  const serverClient = await createSupabaseServerClient();
  const sessionGateway = createSessionGateway(serverClient);

  return await sessionGateway.getCurrentSession();
};
