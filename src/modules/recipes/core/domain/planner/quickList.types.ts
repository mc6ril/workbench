import type { RecipeSelection } from "@/modules/recipes/core/domain/recipe.types";

export type QuickListSelectionStatus = "pending" | "shopping_done";

export type QuickListRecipe = RecipeSelection & {
  status: QuickListSelectionStatus;
};

export type SelectRecipeInput = {
  projectId: string;
  recipeId: string;
};

export type MarkShoppingDoneInput = {
  projectId: string;
  selectionId: string;
};

export type MarkAsCookedInput = {
  projectId: string;
  selectionId: string;
};

export type RemoveSelectionInput = {
  projectId: string;
  selectionId: string;
};

export type CookedSelection = {
  selectionId: string;
  recipeId: string;
  title: string;
};
