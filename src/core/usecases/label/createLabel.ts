import type {
  CreateLabelInput,
  Label,
} from "@/core/domain/schema/label.schema";
import { CreateLabelInputSchema } from "@/core/domain/schema/label.schema";

import type { LabelRepository } from "@/core/ports/labelRepository";

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
