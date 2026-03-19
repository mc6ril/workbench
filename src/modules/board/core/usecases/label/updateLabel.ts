import type {
  Label,
  UpdateLabelInput,
} from "@/modules/board/core/domain/schema/label.schema";
import { UpdateLabelInputSchema } from "@/modules/board/core/domain/schema/label.schema";
import type { LabelRepository } from "@/modules/board/core/ports/labelRepository";

/**
 * Update a label.
 */
export const updateLabel = async (
  labelId: string,
  input: UpdateLabelInput,
  repo: LabelRepository
): Promise<Label> => {
  const validated = UpdateLabelInputSchema.parse(input);
  return repo.update(labelId, validated);
};
