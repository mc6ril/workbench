import type { UserProfile } from "@/domains/project-management/core/domain/schema/userProfile.schema";

import type { UserProfileRow } from "@/infrastructure/supabase/types";

import { toDate } from "@/shared/utils/guards";

import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
  UserPreferencesSchema,
} from "@/domains/auth/core/domain/schema/auth.schema";

/**
 * Parses the jsonb preferences column into a validated UserPreferences object.
 * Falls back to defaults for missing or invalid fields.
 */
const parsePreferences = (raw: Record<string, unknown>): UserPreferences => {
  const result = UserPreferencesSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }

  return {
    theme:
      typeof raw["theme"] === "string" &&
      ["light", "dark", "system"].includes(raw["theme"])
        ? (raw["theme"] as UserPreferences["theme"])
        : DEFAULT_USER_PREFERENCES.theme,
    emailNotifications:
      typeof raw["emailNotifications"] === "boolean"
        ? raw["emailNotifications"]
        : DEFAULT_USER_PREFERENCES.emailNotifications,
    language:
      typeof raw["language"] === "string" && raw["language"].length > 0
        ? raw["language"]
        : DEFAULT_USER_PREFERENCES.language,
  };
};

/**
 * Maps a Supabase row to a domain UserProfile entity.
 * Translates snake_case database fields to camelCase domain fields.
 */
export const mapUserProfileRowToDomain = (row: UserProfileRow): UserProfile => {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    preferences: parsePreferences(row.preferences ?? {}),
    termsAcceptedAt: row.terms_accepted_at
      ? toDate(row.terms_accepted_at)
      : null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};

/**
 * Maps multiple Supabase rows to domain UserProfile entities.
 */
export const mapUserProfileRowsToDomain = (
  rows: UserProfileRow[]
): UserProfile[] => {
  return rows.map(mapUserProfileRowToDomain);
};
