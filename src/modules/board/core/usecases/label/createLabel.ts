import type {
  CreateLabelInput,
  Label,
} from "@/modules/board/core/domain/schema/label.schema";
import { CreateLabelInputSchema } from "@/modules/board/core/domain/schema/label.schema";

import type { LabelRepository } from "@/modules/board/core/ports/labelRepository";

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
