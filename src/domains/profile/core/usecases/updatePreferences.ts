import { z } from "zod";

import {
  type UserPreferences,
  UserPreferencesSchema,
} from "@/domains/profile/core/domain/profile.types";
import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

export const UpdatePreferencesInputSchema = UserPreferencesSchema.partial();
export type UpdatePreferencesInput = z.infer<
  typeof UpdatePreferencesInputSchema
>;

/**
 * Update the current user's preferences.
 * Merges partial input with current preferences, validates the result,
 * and persists to user_profiles.preferences.
 *
 * @param gateway - Profile gateway
 * @param userId - Authenticated user ID
 * @param currentPreferences - User's current full preferences (for merging)
 * @param input - Partial preferences to merge
 * @throws ZodError if merged preferences are invalid
 * @throws DatabaseError if update fails
 */
export const updatePreferences = async (
  gateway: ProfileGateway,
  userId: string,
  currentPreferences: UserPreferences,
  input: UpdatePreferencesInput
): Promise<void> => {
  const mergedPreferences = { ...currentPreferences, ...input };
  const validatedPreferences = UserPreferencesSchema.parse(mergedPreferences);
  return gateway.updatePreferences(userId, validatedPreferences);
};
