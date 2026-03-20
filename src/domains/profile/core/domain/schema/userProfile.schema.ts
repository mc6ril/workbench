import { z } from "zod";

import { UserPreferencesSchema } from "@/domains/profile/core/domain/schema/profilePreferences.schema";

/**
 * Zod schema for UserProfile entity.
 * Single source of truth for all applicative user data.
 * auth.users only manages email, password, session, and app_metadata.
 */
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  preferences: UserPreferencesSchema,
  termsAcceptedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/** Profile data for a user, including preferences and avatar. */
export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Input for updating a user's profile (display name).
 */
export const UpdateProfileInputSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(100, "Display name must be less than 100 characters")
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

/**
 * Input for uploading an avatar.
 * File is validated at the infrastructure level (size, MIME type).
 */
export const UploadAvatarInputSchema = z.object({
  userId: z.string().uuid(),
});

export type UploadAvatarInput = z.infer<typeof UploadAvatarInputSchema>;
