import { z } from "zod";

import { defaultLocale } from "@/shared/i18n/config";

/**
 * Allowed theme values: light, dark, or system (follows OS preference).
 */
export const ThemeValues = ["light", "dark", "system"] as const;
export type Theme = (typeof ThemeValues)[number];

/**
 * Zod schema for user preferences stored in user_profiles.preferences.
 */
export const UserPreferencesSchema = z.object({
  theme: z.enum(ThemeValues),
  emailNotifications: z.boolean(),
  language: z.string().min(1),
});

/**
 * User preferences (theme, notifications, language).
 */
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

/**
 * Default preferences applied to new users or when stored preferences are missing/invalid.
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "system",
  emailNotifications: true,
  language: defaultLocale,
};

/**
 * Input for partial preference updates.
 * Only the fields provided will be merged with existing preferences.
 */
export const UpdatePreferencesInputSchema = UserPreferencesSchema.partial();
export type UpdatePreferencesInput = z.infer<
  typeof UpdatePreferencesInputSchema
>;
