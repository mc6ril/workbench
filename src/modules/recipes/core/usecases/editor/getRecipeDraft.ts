import type { EditorRepository } from "@/modules/recipes/core/ports/editor/editorRepository";

type Dependencies = {
  editorRepository: EditorRepository;
};

type GetRecipeDraftInput = {
  projectId: string;
  recipeId?: string;
};

export const getRecipeDraft =
  ({ editorRepository }: Dependencies) =>
  ({ projectId, recipeId }: GetRecipeDraftInput) => {
    if (!recipeId) {
      return editorRepository.getCreationDraft(projectId);
    }

    return editorRepository.getDraft(projectId, recipeId);
  };
