import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import type { UserProfile } from "@/domains/profile/core/domain/profile.types";

/**
 * Aggregate read model for the current authenticated viewer.
 * Identity fields (userId, loginEmail, preferences) come from the JWT claims —
 * no DB call required. Display fields (displayName, avatarUrl) come from user_profiles.
 */
export type CurrentViewer = Pick<
  CurrentAuthIdentity,
  "userId" | "loginEmail" | "preferences"
> &
  Pick<UserProfile, "displayName" | "avatarUrl">;
