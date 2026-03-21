import {
  type UpdateProfileInput,
  UpdateProfileInputSchema,
} from "@/domains/profile/core/domain/schema/userProfile.schema";
import type { UserProfileRepository } from "@/domains/profile/core/ports/userProfileRepository";

/**
 * Update the current user's profile (display name).
 * Validates input then delegates to the repository.
 *
 * @param repository - UserProfile repository
 * @param userId - Authenticated user ID
 * @param input - Fields to update (displayName)
 * @throws ZodError if input is invalid
 * @throws DatabaseError if update fails
 */
export const updateProfile = async (
  repository: UserProfileRepository,
  userId: string,
  input: UpdateProfileInput
): Promise<void> => {
  const validated = UpdateProfileInputSchema.parse(input);
  return repository.updateProfile(userId, validated);
};
