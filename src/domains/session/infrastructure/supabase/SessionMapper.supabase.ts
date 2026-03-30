import type { Session } from "@supabase/supabase-js";

import { isSuperuserFromAppMetadata } from "@/domains/auth/infrastructure/supabase/providerCapabilities";
import type { CurrentSession } from "@/domains/session/core/domain/session.types";

/**
 * Maps Supabase Session to a CurrentSession.
 */
export const mapSupabaseSessionToCurrentSession = (
  session: Session,
  userEmail: string
): CurrentSession => {
  return {
    userId: session.user.id,
    loginEmail: userEmail,
    accessToken: session.access_token,
    isSuperuser: isSuperuserFromAppMetadata(session.user.app_metadata),
  };
};
