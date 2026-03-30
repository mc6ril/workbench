import { z } from "zod";

import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

const AvatarOwnerIdSchema = z.string().uuid();

/**
 * Upload an avatar image for the current user.
 * Validates the input, uploads to storage, and updates the profile.
 *
 * @param gateway - Profile gateway
 * @param userId - User ID (must match authenticated user)
 * @param file - Image file to upload
 * @returns Public URL of the uploaded avatar
 * @throws ZodError if userId is invalid
 * @throws Error if file validation fails (size, MIME type)
 * @throws DatabaseError if upload or profile update fails
 */
export const uploadAvatar = async (
  gateway: ProfileGateway,
  userId: string,
  file: File
): Promise<string> => {
  AvatarOwnerIdSchema.parse(userId);
  return gateway.uploadAvatar(userId, file);
};
