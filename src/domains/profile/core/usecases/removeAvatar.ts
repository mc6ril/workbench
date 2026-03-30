import { z } from "zod";

import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

const AvatarOwnerIdSchema = z.string().uuid();

/**
 * Remove the avatar for the current user.
 * Deletes the file from storage and clears the profile's avatar_url.
 *
 * @param gateway - Profile gateway
 * @param userId - User ID (must match authenticated user)
 * @throws ZodError if userId is invalid
 * @throws DatabaseError if deletion fails
 */
export const removeAvatar = async (
  gateway: ProfileGateway,
  userId: string
): Promise<void> => {
  AvatarOwnerIdSchema.parse(userId);
  return gateway.deleteAvatar(userId);
};
