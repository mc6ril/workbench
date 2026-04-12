import type { RecipeTag } from "@/modules/recipes/core/domain/recipe.types";
import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";

type Dependencies = {
  editorRepository: EditorRepository;
};

export const listRecipeEditorTags =
  ({ editorRepository }: Dependencies) =>
  (projectId: string): Promise<RecipeTag[]> => {
    return editorRepository.listTagsByProject(projectId);
  };
