import { mockCurrentAuthIdentity } from "../../../../__mocks__/core/domain/authIdentityMocks";

import {
  DEFAULT_USER_PREFERENCES,
  type UserProfile,
} from "@/domains/profile/core/domain/profile.types";
import { buildCurrentViewer } from "@/domains/viewer/core/usecases/buildCurrentViewer";

describe("buildCurrentViewer", () => {
  it("should compose session and profile into a viewer read-model", () => {
    const profile: UserProfile = {
      id: mockCurrentAuthIdentity.userId,
      displayName: "Cyril",
      avatarUrl: "https://example.com/avatar.webp",
      preferences: DEFAULT_USER_PREFERENCES,
      termsAcceptedAt: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    };

    const result = buildCurrentViewer({
      profile,
      identity: mockCurrentAuthIdentity,
    });

    expect(result).toEqual({
      userId: mockCurrentAuthIdentity.userId,
      loginEmail: mockCurrentAuthIdentity.loginEmail,
      displayName: "Cyril",
      avatarUrl: "https://example.com/avatar.webp",
      preferences: DEFAULT_USER_PREFERENCES,
    });
    expect(result).not.toHaveProperty("accessToken");
  });
});
