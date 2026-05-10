import { z } from "zod";

import { UserPreferencesSchema } from "@/shared/user/userPreferences";

export {
  isThemePreference,
  resolveThemePreference,
  type Theme,
  ThemeValues,
} from "@/shared/theme/config";
export {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
  UserPreferencesSchema,
} from "@/shared/user/userPreferences";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  preferences: UserPreferencesSchema,
  termsAcceptedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
