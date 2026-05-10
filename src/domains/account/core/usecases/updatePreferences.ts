import { z } from "zod";

import {
  type UserPreferences,
  UserPreferencesSchema,
} from "@/shared/user/userPreferences";

import type { AccountGateway } from "@/domains/account/core/ports/account.gateway";

export const UpdatePreferencesInputSchema = UserPreferencesSchema.partial();
export type UpdatePreferencesInput = z.infer<
  typeof UpdatePreferencesInputSchema
>;

export const updatePreferences = async (
  gateway: AccountGateway,
  userId: string,
  currentPreferences: UserPreferences,
  input: UpdatePreferencesInput
): Promise<void> => {
  const mergedPreferences = { ...currentPreferences, ...input };
  const validatedPreferences = UserPreferencesSchema.parse(mergedPreferences);
  return gateway.updatePreferences(userId, validatedPreferences);
};
