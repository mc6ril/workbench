import type { RecipeSelection } from "@/modules/recipes/core/domain/recipe.types";

export type QuickListSelectionStatus = "active" | "done";

export type QuickListRecipe = RecipeSelection & {
  status: "active";
};

export type SelectRecipeInput = {
  projectId: string;
  recipeId: string;
};

export type MarkSelectionDoneInput = {
  projectId: string;
  selectionId: string;
};

export type RemoveSelectionInput = MarkSelectionDoneInput;

export type DoneQuickListSelection = {
  selectionId: string;
  recipeId: string;
  title: string;
  status: "done";
};
