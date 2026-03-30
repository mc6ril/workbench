import { z } from "zod";

import { PROFILE_DISPLAY_NAME_LIMITS } from "@/domains/profile/core/domain/profile.policy";
import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

export const UpdateProfileInputSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(
      PROFILE_DISPLAY_NAME_LIMITS.MAX_LENGTH,
      `Display name must be less than ${PROFILE_DISPLAY_NAME_LIMITS.MAX_LENGTH} characters`
    )
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

/**
 * Update the current user's profile (display name).
 * Validates input then delegates to the gateway.
 *
 * @param gateway - Profile gateway
 * @param userId - Authenticated user ID
 * @param input - Fields to update (displayName)
 * @throws ZodError if input is invalid
 * @throws DatabaseError if update fails
 */
export const updateProfile = async (
  gateway: ProfileGateway,
  userId: string,
  input: UpdateProfileInput
): Promise<void> => {
  const validatedInput = UpdateProfileInputSchema.parse(input);
  return gateway.updateProfile(userId, validatedInput);
};
