import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import type { CurrentViewer } from "@/domains/viewer/core/domain/currentViewer.types";

export const buildCurrentViewer = (
  identity: CurrentAuthIdentity
): CurrentViewer => {
  return {
    userId: identity.userId,
    loginEmail: identity.loginEmail,
    displayName: identity.displayName,
    avatarUrl: identity.avatarUrl,
    preferences: identity.preferences,
  };
};
