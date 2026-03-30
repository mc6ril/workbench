import { z } from "zod";

import { PROFILE_DISPLAY_NAME_LIMITS } from "@/domains/profile/core/domain/profile.policy";
import type { AccountIdentityGateway } from "@/domains/settings/core/ports/accountIdentity.gateway";

const AccountEmailSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}, z.string().email("Invalid email format").optional());

export const UpdateAccountIdentityInputSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(
      PROFILE_DISPLAY_NAME_LIMITS.MAX_LENGTH,
      `Display name must be less than ${PROFILE_DISPLAY_NAME_LIMITS.MAX_LENGTH} characters`
    )
    .optional(),
  email: AccountEmailSchema,
});

export type UpdateAccountIdentityInput = z.infer<
  typeof UpdateAccountIdentityInputSchema
>;

/**
 * Update account identity fields owned by separate backends.
 * Display name is persisted in the profile store, email in the auth provider.
 */
export const updateAccountIdentity = async (
  gateway: AccountIdentityGateway,
  userId: string | null | undefined,
  input: UpdateAccountIdentityInput
): Promise<void> => {
  const validatedInput = UpdateAccountIdentityInputSchema.parse(input);

  if (validatedInput.displayName !== undefined && userId) {
    await gateway.updateDisplayName(userId, validatedInput.displayName);
  }

  if (validatedInput.email) {
    await gateway.updateEmail(validatedInput.email);
  }
};
