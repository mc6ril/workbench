import type { Label } from "@/core/domain/schema/label.schema";

import type { LabelRepository } from "@/core/ports/labelRepository";

/**
 * List all labels for a project.
 */
export const listLabels = async (
  projectId: string,
  repo: LabelRepository
): Promise<Label[]> => {
  return repo.listByProject(projectId);
};
