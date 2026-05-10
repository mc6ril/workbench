import type { UserPreferences } from "@/shared/user/userPreferences";

export type AccountGateway = {
  updateProfile(userId: string, input: { displayName?: string }): Promise<void>;
  updatePreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void>;
  uploadAvatar(userId: string, file: File): Promise<string>;
  deleteAvatar(userId: string): Promise<void>;
  updateEmail(email: string): Promise<void>;
};
