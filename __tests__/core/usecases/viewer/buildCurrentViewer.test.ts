import { mockCurrentSession } from "../../../../__mocks__/core/domain/sessionMocks";

import {
  DEFAULT_USER_PREFERENCES,
  type UserProfile,
} from "@/domains/profile/core/domain/profile.types";
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
      loginEmail: mockCurrentSession.loginEmail,
      displayName: "Cyril",
      avatarUrl: "https://example.com/avatar.webp",
      preferences: DEFAULT_USER_PREFERENCES,
    });
    expect(result).not.toHaveProperty("accessToken");
  });
});
