import type { Label } from "@/domains/project-management/core/domain/schema/label.schema";

import type { LabelRepository } from "@/domains/project-management/core/ports/labelRepository";

/**
 * List all labels for a project.
 */
export const listLabels = async (
  projectId: string,
  repo: LabelRepository
): Promise<Label[]> => {
  return repo.listByProject(projectId);
};
