import { z } from "zod";

import { defaultLocale } from "@/shared/i18n/config";

/**
 * Allowed theme values: light, dark, or system (follows OS preference).
 */
export const ThemeValues = ["light", "dark", "system"] as const;
export type Theme = (typeof ThemeValues)[number];

/**
 * Allowed getting-started states for the onboarding experience.
 */
export const GettingStartedStatusValues = Object.freeze([
  "pending",
  "skipped",
  "completed",
]);

export type GettingStartedStatus = (typeof GettingStartedStatusValues)[number];

export const isThemePreference = (value: string): value is Theme => {
  return (ThemeValues as readonly string[]).includes(value);
};

export const isGettingStartedStatus = (
  value: string
): value is GettingStartedStatus => {
  return (GettingStartedStatusValues as readonly string[]).includes(value);
};

export const resolveThemePreference = (
  value?: string | null,
  fallback: Theme = "system"
): Theme => {
  if (!value) {
    return fallback;
  }

  return isThemePreference(value) ? value : fallback;
};

/**
 * Zod schema for user preferences stored in user_profiles.preferences.
 */
export const UserPreferencesSchema = z.object({
  theme: z.enum(ThemeValues),
  emailNotifications: z.boolean(),
  language: z.string().min(1),
  gettingStartedStatus: z.enum(GettingStartedStatusValues),
  epicsGettingStartedStatus: z.enum(GettingStartedStatusValues),
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
  gettingStartedStatus: "pending",
  epicsGettingStartedStatus: "pending",
};

/**
 * Input for partial preference updates.
 * Only the fields provided will be merged with existing preferences.
 */
export const UpdatePreferencesInputSchema = UserPreferencesSchema.partial();
export type UpdatePreferencesInput = z.infer<
  typeof UpdatePreferencesInputSchema
>;
