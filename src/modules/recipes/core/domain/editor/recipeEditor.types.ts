import type { CatalogRecipeCoverStyle } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { RecipeIngredientKind } from "@/modules/recipes/core/domain/recipe.types";

export type RecipeEditorTagInput = {
  label: string;
};

export type RecipeEditorIngredientInput = {
  amount: string;
  unit: string;
  displayName: string;
  notes: string;
};

export type RecipeEditorStepInput = {
  instruction: string;
  meta: string;
};

export type SaveRecipeEditorInput = {
  projectId: string;
  title: string;
  summary: string;
  servingsCount: string;
  servingsLabel: string;
  totalTimeMinutes: string;
  coverImageUrl: string;
  note: string;
  tags: RecipeEditorTagInput[];
  validatedIngredients: RecipeEditorIngredientInput[];
  additionIngredients: RecipeEditorIngredientInput[];
  steps: RecipeEditorStepInput[];
};

export type PersistedRecipeTagInput = {
  label: string;
  slug: string;
};

export type PersistedRecipeIngredientInput = {
  position: number;
  displayName: string;
  normalizedName: string;
  amountValue: number | null;
  amountText: string | null;
  unit: string | null;
  notes: string | null;
  kind: RecipeIngredientKind;
};

export type PersistedRecipeStepInput = {
  position: number;
  title: string | null;
  instruction: string;
  notes: string | null;
  meta: string | null;
};

export type PersistedRecipeInput = {
  projectId: string;
  title: string;
  summary: string;
  servingsCount: number | null;
  servingsLabel: string;
  totalTimeMinutes: number | null;
  totalTimeLabel: string;
  coverImageUrl: string | null;
  coverStyle: CatalogRecipeCoverStyle;
  note: string | null;
  tags: PersistedRecipeTagInput[];
  ingredients: PersistedRecipeIngredientInput[];
  steps: PersistedRecipeStepInput[];
};

export type CreateRecipeInput = PersistedRecipeInput;

export type UpdateRecipeInput = PersistedRecipeInput & {
  recipeId: string;
};

export type PromoteRecipeAdditionInput = {
  projectId: string;
  recipeId: string;
  ingredientId: string;
};
