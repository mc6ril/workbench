import type {
  Sprint,
  UpdateSprintInput,
} from "@/modules/board/core/domain/schema/sprint.schema";
import { UpdateSprintInputSchema } from "@/modules/board/core/domain/schema/sprint.schema";

import type { SprintRepository } from "@/modules/board/core/ports/sprintRepository";

/**
 * Update an existing sprint.
 * Validates input before delegating to the repository.
 */
export const updateSprint = async (
  sprintId: string,
  input: UpdateSprintInput,
  repo: SprintRepository
): Promise<Sprint> => {
  const validated = UpdateSprintInputSchema.parse(input);
  return repo.update(sprintId, validated);
};
