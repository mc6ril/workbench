import type { LabelRepository } from "@/modules/board/core/ports/labelRepository";

/**
 * Delete a label. Removes all ticket associations.
 */
export const deleteLabel = async (
  labelId: string,
  repo: LabelRepository
): Promise<void> => {
  return repo.delete(labelId);
};
