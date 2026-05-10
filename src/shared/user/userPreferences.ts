import { z } from "zod";

import { defaultLocale } from "@/shared/i18n/config";
import { ThemeValues } from "@/shared/theme/config";

export const UserPreferencesSchema = z.object({
  theme: z.enum([...ThemeValues]),
  emailNotifications: z.boolean(),
  language: z.string().min(1),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "system",
  emailNotifications: true,
  language: defaultLocale,
};
