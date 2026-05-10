import { z } from "zod";

import { ACCOUNT_DISPLAY_NAME_LIMITS } from "@/domains/account/core/domain/account.policy";
import type { AccountGateway } from "@/domains/account/core/ports/account.gateway";

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
      ACCOUNT_DISPLAY_NAME_LIMITS.MAX_LENGTH,
      `Display name must be less than ${ACCOUNT_DISPLAY_NAME_LIMITS.MAX_LENGTH} characters`
    )
    .optional(),
  email: AccountEmailSchema,
});

export type UpdateAccountIdentityInput = z.infer<
  typeof UpdateAccountIdentityInputSchema
>;

export const updateAccountIdentity = async (
  gateway: AccountGateway,
  userId: string | null | undefined,
  input: UpdateAccountIdentityInput
): Promise<void> => {
  const validatedInput = UpdateAccountIdentityInputSchema.parse(input);

  if (validatedInput.displayName !== undefined && userId) {
    await gateway.updateProfile(userId, {
      displayName: validatedInput.displayName,
    });
  }

  if (validatedInput.email) {
    await gateway.updateEmail(validatedInput.email);
  }
};
