import type { LabelRepository } from "@/domains/project-management/core/ports/labelRepository";

/**
 * Delete a label. Removes all ticket associations.
 */
export const deleteLabel = async (
  labelId: string,
  repo: LabelRepository
): Promise<void> => {
  return repo.delete(labelId);
};
