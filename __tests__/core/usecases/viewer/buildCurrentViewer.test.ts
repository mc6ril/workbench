import { mockCurrentAuthIdentity } from "../../../../__mocks__/core/domain/authIdentityMocks";

import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";
import { buildCurrentViewer } from "@/domains/viewer/core/usecases/buildCurrentViewer";

describe("buildCurrentViewer", () => {
  it("should project identity into a viewer read-model", () => {
    const identity = {
      ...mockCurrentAuthIdentity,
      displayName: "Cyril",
      avatarUrl: "https://example.com/avatar.webp",
    };

    const result = buildCurrentViewer(identity);

    expect(result).toEqual({
      userId: identity.userId,
      loginEmail: identity.loginEmail,
      displayName: "Cyril",
      avatarUrl: "https://example.com/avatar.webp",
      preferences: DEFAULT_USER_PREFERENCES,
    });
    expect(result).not.toHaveProperty("accessToken");
  });
});
