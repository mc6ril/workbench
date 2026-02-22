import { z } from "zod";

/**
 * Zod schema for UserProfile entity.
 * Represents a user's public profile data, synced from auth.users.
 */
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/** Public profile data for a user, visible to project teammates. */
export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Input for uploading an avatar.
 * File is validated at the infrastructure level (size, MIME type).
 */
export const UploadAvatarInputSchema = z.object({
  userId: z.string().uuid(),
});

export type UploadAvatarInput = z.infer<typeof UploadAvatarInputSchema>;
