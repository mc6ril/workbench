import { createNotFoundError } from "@/core/domain/repositoryError";
import {
  type Epic,
  type UpdateEpicInput,
  UpdateEpicInputSchema,
} from "@/core/domain/schema/epic.schema";

import type { EpicRepository } from "@/core/ports/epicRepository";

/**
 * Update an existing epic.
 * Validates input and updates the epic.
 * Preserves invariants (e.g., epics belong to a single project).
 *
 * @param repository - Epic repository
 * @param id - Epic ID
 * @param input - Epic update data
 * @returns Updated epic
 * @throws NotFoundError if epic not found
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const updateEpic = async (
  repository: EpicRepository,
  id: string,
  input: UpdateEpicInput
): Promise<Epic> => {
  // Validate input with Zod schema
  const validatedInput = UpdateEpicInputSchema.parse(input);

  // Fetch existing epic
  const existingEpic = await repository.findById(id);
  if (!existingEpic) {
    throw createNotFoundError("Epic", id);
  }

  // Call repository to update epic
  return repository.update(id, validatedInput);
};
