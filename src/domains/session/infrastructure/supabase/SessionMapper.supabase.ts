import type { JwtPayload, Session } from "@supabase/supabase-js";

import {
  DEFAULT_USER_PREFERENCES,
  UserPreferences,
} from "@/domains/profile/core/domain/profile.types";
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

export const mapAuthenticatedIdentityToCurrentSession = (
  claims: JwtPayload
): CurrentSession => {
  const userId = claims.sub;
  const userMetadata = claims.user_metadata;
  const userEmail = userMetadata?.email;
  const preferences: UserPreferences = userMetadata?.preferences;

  return {
    userId: userId,
    loginEmail: userEmail,
    displayName: userMetadata?.display_name ?? "",
    avatarUrl: userMetadata?.avatar_url ?? "",
    language: preferences?.language ?? DEFAULT_USER_PREFERENCES.language,
    theme: preferences?.theme ?? DEFAULT_USER_PREFERENCES.theme,
  };
};
