import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import type { UserProfile } from "@/domains/profile/core/domain/profile.types";

/**
 * Aggregate read model for the current authenticated viewer.
 * It intentionally exposes identity and profile information, but never raw
 * session tokens or infrastructure-specific details.
 */
export type CurrentViewer = Pick<CurrentAuthIdentity, "userId" | "loginEmail"> &
  Pick<UserProfile, "displayName" | "avatarUrl" | "preferences">;
