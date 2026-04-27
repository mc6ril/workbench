import type { Session } from "@supabase/supabase-js";

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
  };
};
