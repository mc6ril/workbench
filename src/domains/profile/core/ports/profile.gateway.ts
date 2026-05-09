import type { UserPreferences } from "@/domains/profile/core/domain/profile.types";

export type ProfileGateway = {
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
