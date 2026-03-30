import type { UserProfile } from "@/domains/profile/core/domain/profile.types";
import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import type { CurrentViewer } from "@/domains/viewer/core/domain/currentViewer.schema";

type BuildCurrentViewerInput = {
  profile: UserProfile;
  session: CurrentSession;
};

/**
 * Projects current session and current profile into a single read-model for UI.
 */
export const buildCurrentViewer = ({
  profile,
  session,
}: BuildCurrentViewerInput): CurrentViewer => {
  return {
    userId: session.userId,
    loginEmail: session.loginEmail,
    isSuperuser: session.isSuperuser,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    preferences: profile.preferences,
  };
};
