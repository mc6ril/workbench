import type { UserProfile } from "@/domains/auth/core/domain/schema/userProfile.schema";
import type { UserProfileRepository } from "@/domains/auth/core/ports/userProfileRepository";

/**
 * Get a user profile by ID.
 *
 * @param repository - UserProfile repository
 * @param userId - User ID to look up
 * @returns UserProfile or null if not found
 * @throws DatabaseError if database operation fails
 */
export const getProfile = async (
  repository: UserProfileRepository,
  userId: string
): Promise<UserProfile | null> => {
  return repository.getById(userId);
};
