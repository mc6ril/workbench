import { UploadAvatarInputSchema } from "@/domains/auth/core/domain/schema/userProfile.schema";

import type { UserProfileRepository } from "@/domains/auth/core/ports/userProfileRepository";

/**
 * Remove the avatar for the current user.
 * Deletes the file from storage and clears the profile's avatar_url.
 *
 * @param repository - UserProfile repository
 * @param userId - User ID (must match authenticated user)
 * @throws ZodError if userId is invalid
 * @throws DatabaseError if deletion fails
 */
export const removeAvatar = async (
  repository: UserProfileRepository,
  userId: string
): Promise<void> => {
  UploadAvatarInputSchema.parse({ userId });
  return repository.deleteAvatar(userId);
};
