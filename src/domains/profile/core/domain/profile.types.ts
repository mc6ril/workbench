import { z } from "zod";

import { defaultLocale } from "@/shared/i18n/config";

export const ThemeValues = ["light", "dark", "system"] as const;
export type Theme = (typeof ThemeValues)[number];

export const GettingStartedStatusValues = [
  "pending",
  "skipped",
  "completed",
] as const;
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

export const UserPreferencesSchema = z.object({
  theme: z.enum(ThemeValues),
  emailNotifications: z.boolean(),
  language: z.string().min(1),
  gettingStartedStatus: z.enum(GettingStartedStatusValues),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "system",
  emailNotifications: true,
  language: defaultLocale,
  gettingStartedStatus: "pending",
};

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

export type UserProfile = z.infer<typeof UserProfileSchema>;
