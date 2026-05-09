import { isRecord, toDate } from "@/shared/utils/guards";

import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
  UserPreferencesSchema,
  type UserProfile,
} from "@/domains/profile/core/domain/profile.types";
import type { UserProfileRow } from "@/domains/profile/infrastructure/types";

const parsePreferences = (raw: unknown): UserPreferences => {
  const preferences = isRecord(raw) ? raw : {};
  const result = UserPreferencesSchema.safeParse(preferences);
  if (result.success) {
    return result.data;
  }

  return {
    theme:
      typeof preferences["theme"] === "string" &&
      ["light", "dark", "system"].includes(preferences["theme"])
        ? (preferences["theme"] as UserPreferences["theme"])
        : DEFAULT_USER_PREFERENCES.theme,
    emailNotifications:
      typeof preferences["emailNotifications"] === "boolean"
        ? preferences["emailNotifications"]
        : DEFAULT_USER_PREFERENCES.emailNotifications,
    language:
      typeof preferences["language"] === "string" &&
      preferences["language"].length > 0
        ? preferences["language"]
        : DEFAULT_USER_PREFERENCES.language,
  };
};

export const mapUserProfileRowToDomain = (row: UserProfileRow): UserProfile => {
  return {
    id: row.id,
    preferences: parsePreferences(row.preferences ?? {}),
    termsAcceptedAt: row.terms_accepted_at
      ? toDate(row.terms_accepted_at)
      : null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};

export const mapUserProfileRowsToDomain = (
  rows: UserProfileRow[]
): UserProfile[] => {
  return rows.map(mapUserProfileRowToDomain);
};
