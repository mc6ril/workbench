import type { Label } from "@/modules/board/core/domain/schema/label.schema";

import type { LabelRepository } from "@/modules/board/core/ports/labelRepository";

/**
 * List all labels for a project.
 */
export const listLabels = async (
  projectId: string,
  repo: LabelRepository
): Promise<Label[]> => {
  return repo.listByProject(projectId);
};
