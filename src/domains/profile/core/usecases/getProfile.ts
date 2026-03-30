import type { UserProfile } from "@/domains/profile/core/domain/profile.types";
import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

/**
 * Get a user profile by ID.
 *
 * @param gateway - Profile gateway
 * @param userId - User ID to look up
 * @returns UserProfile or null if not found
 * @throws DatabaseError if database operation fails
 */
export const getProfile = async (
  gateway: ProfileGateway,
  userId: string
): Promise<UserProfile | null> => {
  return gateway.getById(userId);
};
