import { UploadAvatarInputSchema } from "@/domains/profile/core/domain/schema/userProfile.schema";
import type { UserProfileRepository } from "@/domains/profile/core/ports/userProfileRepository";

/**
 * Upload an avatar image for the current user.
 * Validates the input, uploads to storage, and updates the profile.
 *
 * @param repository - UserProfile repository
 * @param userId - User ID (must match authenticated user)
 * @param file - Image file to upload
 * @returns Public URL of the uploaded avatar
 * @throws ZodError if userId is invalid
 * @throws Error if file validation fails (size, MIME type)
 * @throws DatabaseError if upload or profile update fails
 */
export const uploadAvatar = async (
  repository: UserProfileRepository,
  userId: string,
  file: File
): Promise<string> => {
  UploadAvatarInputSchema.parse({ userId });
  return repository.uploadAvatar(userId, file);
};
