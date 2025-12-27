import { z } from "zod";

import type { AuthRepository } from "@/core/ports/authRepository";

/**
 * Schema for updating user information.
 * All fields are optional - user can update email, password, or metadata.
 */
export const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters")
    .optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Update user input type.
 */
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Update user information.
 * Validates input and updates the user.
 * All fields are optional - at least one must be provided.
 *
 * @param repository - Auth repository
 * @param input - User update input (email, password, or data - all optional)
 * @throws AuthenticationFailure if update fails
 */
export async function updateUser(
  repository: AuthRepository,
  input: UpdateUserInput
): Promise<void> {
  // Validate input with Zod schema
  const validatedInput = UpdateUserSchema.parse(input);

  // Ensure at least one field is provided
  if (
    !validatedInput.email &&
    !validatedInput.password &&
    !validatedInput.data
  ) {
    throw new Error(
      "At least one field (email, password, or data) must be provided"
    );
  }

  // Filter out undefined values
  const updateData: {
    email?: string;
    password?: string;
    data?: Record<string, unknown>;
  } = {};

  if (validatedInput.email) {
    updateData.email = validatedInput.email;
  }

  if (validatedInput.password) {
    updateData.password = validatedInput.password;
  }

  if (validatedInput.data) {
    updateData.data = validatedInput.data;
  }

  // Call repository to update user
  return repository.updateUser(updateData);
}
