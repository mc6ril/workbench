import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";

/**
 * Aggregate read model for the current authenticated viewer.
 * All fields come from JWT claims via getClaims() — no DB call required.
 */
export type CurrentViewer = Pick<
  CurrentAuthIdentity,
  "userId" | "loginEmail" | "preferences" | "displayName" | "avatarUrl"
>;
