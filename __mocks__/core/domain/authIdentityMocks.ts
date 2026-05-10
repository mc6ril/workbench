import { DEFAULT_USER_PREFERENCES } from "@/shared/user/userPreferences";

import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";

export const mockCurrentAuthIdentity: CurrentAuthIdentity = {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  loginEmail: "test@example.com",
  isSuperuser: false,
  canUpdatePassword: true,
  displayName: null,
  avatarUrl: null,
  preferences: DEFAULT_USER_PREFERENCES,
};
