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

  it("maps valid preferences from stored data", () => {
    const result = mapUserProfileRowToDomain({
      ...baseRow,
      preferences: {
        theme: "dark",
        emailNotifications: false,
        language: "fr",
      },
    });

    expect(result.preferences).toEqual({
      theme: "dark",
      emailNotifications: false,
      language: "fr",
    });
  });

  it("falls back to defaults when stored preferences are invalid", () => {
    const result = mapUserProfileRowToDomain({
      ...baseRow,
      preferences: {
        theme: "unknown-theme",
        emailNotifications: false,
        language: "fr",
      },
    });

    expect(result.preferences).toEqual({
      theme: DEFAULT_USER_PREFERENCES.theme,
      emailNotifications: false,
      language: "fr",
    });
  });
});
