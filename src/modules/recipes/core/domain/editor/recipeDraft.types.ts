import type {
  Recipe,
  RecipeIngredient,
  RecipeIngredientKind,
  RecipeStep,
} from "@/modules/recipes/core/domain/recipe.types";

export type RecipeDraftIngredientStatus = RecipeIngredientKind;

export type RecipeDraftIngredient = RecipeIngredient;

export type RecipeDraftStep = RecipeStep;

export type RecipeDraft = Omit<Recipe, "id"> & {
  id: string | null;
};

export const EMPTY_RECIPE_DRAFT: RecipeDraft = {
  id: null,
  title: "",
  summary: "",
  totalTimeMinutes: null,
  totalTimeLabel: "",
  servingsCount: null,
  servingsLabel: "",
  seasonalMonths: [],
  tags: [],
  ingredients: [],
  steps: [],
  note: null,
  coverImageUrl: null,
};
