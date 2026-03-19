import { createDomainRuleError } from "@/domains/project-management/core/domain/domainRuleError";

import {
  type UpdateUserInput,
  UpdateUserSchema,
} from "@/domains/auth/core/domain/schema/auth.schema";
import type { AuthRepository } from "@/domains/auth/core/ports/authRepository";

/**
 * Update auth credentials (email and/or password).
 * Profile data (display_name, preferences) is managed via profile usecases.
 *
 * @param repository - Auth repository
 * @param input - Auth credential update (email and/or password)
 * @throws AuthenticationFailure if update fails
 */
export const updateUser = async (
  repository: AuthRepository,
  input: UpdateUserInput
): Promise<void> => {
  const validatedInput = UpdateUserSchema.parse(input);

  if (!validatedInput.email && !validatedInput.password) {
    throw createDomainRuleError(
      "UPDATE_USER_NO_FIELDS",
      "At least one field (email or password) must be provided"
    );
  }

  const updateData: { email?: string; password?: string } = {};

  if (validatedInput.email) {
    updateData.email = validatedInput.email;
  }

  if (validatedInput.password) {
    updateData.password = validatedInput.password;
  }

  return repository.updateUser(updateData);
};
