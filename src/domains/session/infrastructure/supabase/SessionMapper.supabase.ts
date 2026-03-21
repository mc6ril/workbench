import type { Session } from "@supabase/supabase-js";

import type { CurrentSession } from "@/domains/session/core/domain/currentSession.schema";

/**
 * Extracts the super user flag from Supabase app_metadata.
 * app_metadata is server-controlled and cannot be modified by the user.
 */
const extractSuperuserFlag = (
  appMetadata: Record<string, unknown> | undefined
): boolean => {
  return appMetadata?.is_superuser === true;
};

/**
 * Maps Supabase Session to a CurrentSession.
 */
export const mapSupabaseSessionToCurrentSession = (
  session: Session,
  userEmail: string
): CurrentSession => {
  return {
    userId: session.user.id,
    email: userEmail,
    accessToken: session.access_token,
    isSuperuser: extractSuperuserFlag(session.user.app_metadata),
  };
};
