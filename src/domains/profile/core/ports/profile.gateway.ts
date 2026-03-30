import type {
  UserPreferences,
  UserProfile,
} from "@/domains/profile/core/domain/profile.types";

/**
 * Gateway contract for profile persistence and asset storage operations.
 *
 * user_profiles is the single source of truth for applicative user data.
 * Profile rows are created on signup via a database trigger.
 *
 * Invariants:
 * - A profile exists for every auth.users row (guaranteed by signup trigger)
 * - Only the owning user can update their own profile
 * - All authenticated users can read any profile (needed for teammate display)
 */
export type ProfileGateway = {
  /**
   * Get a user profile by user ID.
   * @returns Profile or null if not found
   * @throws DatabaseError if database operation fails
   */
  getById(userId: string): Promise<UserProfile | null>;

  /**
   * Update the user's profile (display name).
   * @param userId - User ID (must match authenticated user)
   * @param input - Fields to update
   * @throws DatabaseError if update fails
   */
  updateProfile(userId: string, input: { displayName?: string }): Promise<void>;

  /**
   * Update the user's preferences (theme, language, notifications).
   * Replaces the entire preferences object.
   * @param userId - User ID (must match authenticated user)
   * @param preferences - Full preferences object to persist
   * @throws DatabaseError if update fails
   */
  updatePreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void>;

  /**
   * Upload an avatar file to storage and update the profile's avatar_url.
   * The image is normalized to WebP before upload and overwrites any existing avatar for the user.
   * @param userId - User ID (must match authenticated user)
   * @param file - Image file (jpeg, png, or webp)
   * @returns Public URL of the uploaded avatar
   * @throws Error if the image is too large to process or cannot be converted
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
