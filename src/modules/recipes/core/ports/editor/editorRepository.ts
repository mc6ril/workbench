import type { RecipeDraft } from "@/modules/recipes/core/domain/editor/recipeDraft.types";

export type EditorRepository = {
  getCreationDraft: (projectId: string) => Promise<RecipeDraft>;
  getDraft: (
    projectId: string,
    recipeId: string
  ) => Promise<RecipeDraft | null>;
};
