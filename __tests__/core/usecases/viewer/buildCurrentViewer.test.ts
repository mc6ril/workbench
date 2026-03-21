// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { mockCurrentSession } from "../../../../__mocks__/core/domain/sessionMocks";

import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/schema/profilePreferences.schema";
import type { UserProfile } from "@/domains/profile/core/domain/schema/userProfile.schema";
import { buildCurrentViewer } from "@/domains/viewer/core/usecases/buildCurrentViewer";

describe("buildCurrentViewer", () => {
  it("should compose session and profile into a viewer read-model", () => {
    const profile: UserProfile = {
      id: mockCurrentSession.userId,
      email: "profile@example.com",
      displayName: "Cyril",
      avatarUrl: "https://example.com/avatar.webp",
      preferences: DEFAULT_USER_PREFERENCES,
      termsAcceptedAt: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    };

    const result = buildCurrentViewer({
      profile,
      session: mockCurrentSession,
    });

    expect(result).toEqual({
      userId: mockCurrentSession.userId,
      email: mockCurrentSession.email,
      isSuperuser: mockCurrentSession.isSuperuser,
      displayName: "Cyril",
      avatarUrl: "https://example.com/avatar.webp",
      preferences: DEFAULT_USER_PREFERENCES,
    });
    expect(result).not.toHaveProperty("accessToken");
  });
});
