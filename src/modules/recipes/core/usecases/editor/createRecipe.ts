import type { SaveRecipeEditorInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";
import { normalizeRecipeEditorSubmission } from "@/modules/recipes/core/usecases/editor/saveRecipe";

type Dependencies = {
  editorRepository: EditorRepository;
};

export const createRecipe =
  ({ editorRepository }: Dependencies) =>
  (input: SaveRecipeEditorInput) => {
    return editorRepository.createRecipe(normalizeRecipeEditorSubmission(input));
  };
