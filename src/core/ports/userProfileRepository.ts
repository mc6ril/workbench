import type { UserProfile } from "@/core/domain/schema/userProfile.schema";

/**
 * Repository contract for UserProfile operations.
 *
 * User profiles are synced from auth.users via database trigger.
 * Direct creation is not supported — profiles are read-only except for avatar management.
 *
 * Invariants:
 * - A profile exists for every auth.users row (guaranteed by sync trigger)
 * - Only the owning user can update their avatar
 * - All authenticated users can read any profile (needed for teammate display)
 */
export type UserProfileRepository = {
  /**
   * Get a user profile by user ID.
   * @returns Profile or null if not found
   * @throws DatabaseError if database operation fails
   */
  getById(userId: string): Promise<UserProfile | null>;

  /**
   * Get multiple user profiles by their IDs.
   * Returns only found profiles (missing IDs are silently skipped).
   * @returns Array of profiles (order not guaranteed)
   * @throws DatabaseError if database operation fails
   */
  getByIds(userIds: string[]): Promise<UserProfile[]>;

  /**
   * Get a user profile by email address.
   * @returns Profile or null if not found
   * @throws DatabaseError if database operation fails
   */
  getByEmail(email: string): Promise<UserProfile | null>;

  /**
   * Upload an avatar file to storage and update the profile's avatar_url.
   * Overwrites any existing avatar for the user.
   * @param userId - User ID (must match authenticated user)
   * @param file - Image file (jpeg, png, or webp, max 2MB)
   * @returns Public URL of the uploaded avatar
   * @throws DatabaseError if upload or profile update fails
   */
  uploadAvatar(userId: string, file: File): Promise<string>;

  /**
   * Delete the user's avatar from storage and clear the avatar_url.
   * No-op if user has no avatar.
   * @param userId - User ID (must match authenticated user)
   * @throws DatabaseError if deletion fails
   */
  deleteAvatar(userId: string): Promise<void>;
};
