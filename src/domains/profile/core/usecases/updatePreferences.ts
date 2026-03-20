import {
  type UpdatePreferencesInput,
  type UserPreferences,
  UserPreferencesSchema,
} from "@/domains/auth/core/domain/schema/auth.schema";
import type { UserProfileRepository } from "@/domains/profile/core/ports/userProfileRepository";

/**
 * Update the current user's preferences.
 * Merges partial input with current preferences, validates the result,
 * and persists to user_profiles.preferences.
 *
 * @param repository - UserProfile repository
 * @param userId - Authenticated user ID
 * @param currentPreferences - User's current full preferences (for merging)
 * @param input - Partial preferences to merge
 * @throws ZodError if merged preferences are invalid
 * @throws DatabaseError if update fails
 */
export const updatePreferences = async (
  repository: UserProfileRepository,
  userId: string,
  currentPreferences: UserPreferences,
  input: UpdatePreferencesInput
): Promise<void> => {
  const merged = { ...currentPreferences, ...input };
  const validated = UserPreferencesSchema.parse(merged);
  return repository.updatePreferences(userId, validated);
};
