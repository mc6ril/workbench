import type { SprintRepository } from "@/core/ports/sprintRepository";

/**
 * Delete a sprint. Tickets assigned to it will have their sprint_id set to NULL,
 * returning them to the project default flow.
 */
export const deleteSprint = async (
  sprintId: string,
  repo: SprintRepository
): Promise<void> => {
  return repo.delete(sprintId);
};
