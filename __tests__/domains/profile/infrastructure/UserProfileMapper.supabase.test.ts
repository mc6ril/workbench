import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";
import type { UserProfileRow } from "@/domains/profile/infrastructure/types";
import { mapUserProfileRowToDomain } from "@/domains/profile/infrastructure/UserProfileMapper.supabase";

describe("UserProfileMapper.supabase", () => {
  const baseRow: UserProfileRow = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "cyril@example.com",
    display_name: "Cyril",
    avatar_url: null,
    preferences: {},
    terms_accepted_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
  };

  it("maps a valid getting-started status from stored preferences", () => {
    const result = mapUserProfileRowToDomain({
      ...baseRow,
      preferences: {
        theme: "dark",
        emailNotifications: false,
        language: "fr",
        gettingStartedStatus: "completed",
      },
    });

    expect(result.preferences).toEqual({
      theme: "dark",
      emailNotifications: false,
      language: "fr",
      gettingStartedStatus: "completed",
    });
  });

  it("falls back to the default getting-started status when the stored value is invalid", () => {
    const result = mapUserProfileRowToDomain({
      ...baseRow,
      preferences: {
        theme: "dark",
        emailNotifications: false,
        language: "fr",
        gettingStartedStatus: "archived",
      },
    });

    expect(result.preferences).toEqual({
      theme: "dark",
      emailNotifications: false,
      language: "fr",
      gettingStartedStatus: DEFAULT_USER_PREFERENCES.gettingStartedStatus,
    });
  });
});
