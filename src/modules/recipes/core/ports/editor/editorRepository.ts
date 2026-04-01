import type { RecipeDraft } from "@/modules/recipes/core/domain/editor/recipeDraft.types";
import type {
  CreateRecipeInput,
  UpdateRecipeInput,
} from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import type { RecipeTag } from "@/modules/recipes/core/domain/recipe.types";

export type EditorRepository = {
  getCreationDraft: (projectId: string) => Promise<RecipeDraft>;
  getDraft: (
    projectId: string,
    recipeId: string
  ) => Promise<RecipeDraft | null>;
  listTagsByProject: (projectId: string) => Promise<RecipeTag[]>;
  createRecipe: (input: CreateRecipeInput) => Promise<RecipeDraft>;
  updateRecipe: (input: UpdateRecipeInput) => Promise<RecipeDraft>;
};
