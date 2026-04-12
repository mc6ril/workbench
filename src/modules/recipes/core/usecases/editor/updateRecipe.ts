import type { SaveRecipeEditorInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";
import { normalizeRecipeEditorSubmission } from "@/modules/recipes/core/usecases/editor/saveRecipe";

type Dependencies = {
  editorRepository: EditorRepository;
};

type UpdateRecipeInput = SaveRecipeEditorInput & {
  recipeId: string;
};

export const updateRecipe =
  ({ editorRepository }: Dependencies) =>
  ({ recipeId, ...input }: UpdateRecipeInput) => {
    return editorRepository.updateRecipe({
      recipeId,
      ...normalizeRecipeEditorSubmission(input),
    });
  };
