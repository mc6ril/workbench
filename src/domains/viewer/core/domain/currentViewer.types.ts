import type { UserProfile } from "@/domains/profile/core/domain/profile.types";
import type { CurrentSession } from "@/domains/session/core/domain/session.types";

/**
 * Aggregate read model for the current authenticated viewer.
 * It intentionally exposes identity and profile information, but never raw
 * session tokens or infrastructure-specific details.
 */
export type CurrentViewer = Pick<
  CurrentSession,
  "userId" | "loginEmail" | "isSuperuser"
> &
  Pick<UserProfile, "displayName" | "avatarUrl" | "preferences">;
