import { z } from "zod";

import type { ProfileGateway } from "@/domains/profile/core/ports/profile.gateway";

export const UpdateProfileInputSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(100, "Display name must be less than 100 characters")
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
