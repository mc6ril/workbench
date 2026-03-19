import {
  type CreateEpicInput,
  CreateEpicInputSchema,
  type Epic,
} from "@/modules/board/core/domain/schema/epic.schema";
import type { EpicRepository } from "@/modules/board/core/ports/epicRepository";

/**
 * Create a new epic.
 * Validates input and creates a new epic.
 *
 * @param repository - Epic repository
 * @param input - Epic creation data
 * @returns Created epic
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const createEpic = async (
  repository: EpicRepository,
  input: CreateEpicInput
): Promise<Epic> => {
  // Validate input with Zod schema
  const validatedInput = CreateEpicInputSchema.parse(input);

  const codeNumber = await repository.getNextCodeNumberForProject(
    validatedInput.projectId
  );

  // Call repository to create epic with allocated code number
  return repository.create({
    ...validatedInput,
    codeNumber,
  });
};
