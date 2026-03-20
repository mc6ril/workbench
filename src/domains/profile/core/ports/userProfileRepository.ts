import type { UserPreferences } from "@/domains/auth/core/domain/schema/auth.schema";
import type {
  UpdateProfileInput,
  UserProfile,
} from "@/domains/profile/core/domain/schema/userProfile.schema";

/**
 * Repository contract for UserProfile operations.
 *
 * user_profiles is the single source of truth for applicative user data.
 * Profile rows are created on signup via a database trigger.
 *
 * Invariants:
 * - A profile exists for every auth.users row (guaranteed by signup trigger)
 * - Only the owning user can update their own profile
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
   * Update the user's profile (display name).
   * @param userId - User ID (must match authenticated user)
   * @param input - Fields to update
   * @throws DatabaseError if update fails
   */
  updateProfile(userId: string, input: UpdateProfileInput): Promise<void>;

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
