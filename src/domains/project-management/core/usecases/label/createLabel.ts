import type {
  CreateLabelInput,
  Label,
} from "@/domains/project-management/core/domain/schema/label.schema";
import { CreateLabelInputSchema } from "@/domains/project-management/core/domain/schema/label.schema";

import type { LabelRepository } from "@/domains/project-management/core/ports/labelRepository";

/**
 * Create a new label in a project.
 */
export const createLabel = async (
  input: CreateLabelInput,
  repo: LabelRepository
): Promise<Label> => {
  const validated = CreateLabelInputSchema.parse(input);
  return repo.create(validated);
};
