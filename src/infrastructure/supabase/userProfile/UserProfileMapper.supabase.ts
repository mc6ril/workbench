import type { UserProfile } from "@/core/domain/schema/userProfile.schema";

import type { UserProfileRow } from "@/infrastructure/supabase/types";

import { toDate } from "@/shared/utils/guards";

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
