import type { UserProfile } from "@/domains/profile/core/domain/profile.types";
import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import type { CurrentViewer } from "@/domains/viewer/core/domain/currentViewer.types";

type BuildCurrentViewerInput = {
  profile: UserProfile;
  session: CurrentSession;
};

/**
 * Projects the current session and profile into a single viewer read model.
 */
export const buildCurrentViewer = ({
  profile,
  session,
}: BuildCurrentViewerInput): CurrentViewer => {
  return {
    userId: session.userId,
    loginEmail: session.loginEmail,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    preferences: profile.preferences,
  };
};
