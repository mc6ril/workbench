import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import type { UserProfile } from "@/domains/profile/core/domain/profile.types";
import type { CurrentViewer } from "@/domains/viewer/core/domain/currentViewer.types";

type BuildCurrentViewerInput = {
  profile: UserProfile;
  identity: CurrentAuthIdentity;
};

/**
 * Projects the current session and profile into a single viewer read model.
 */
export const buildCurrentViewer = ({
  identity,
  profile,
}: BuildCurrentViewerInput): CurrentViewer => {
  return {
    userId: identity.userId,
    loginEmail: identity.loginEmail,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    preferences: profile.preferences,
  };
};
