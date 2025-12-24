import type { Session } from "@supabase/supabase-js";

import type { AuthSession } from "@/core/domain/auth/auth.schema";

/**
 * Maps Supabase Session to domain AuthSession.
 *
 * @param session - Supabase session
 * @param userEmail - User email from Supabase user object
 * @returns Domain auth session
 */
export const mapSupabaseSessionToDomain = (
  session: Session,
  userEmail: string
): AuthSession => {
  return {
    userId: session.user.id,
    email: userEmail,
    accessToken: session.access_token,
  };
};
