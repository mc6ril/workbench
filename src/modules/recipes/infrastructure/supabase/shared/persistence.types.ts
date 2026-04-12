import type { CatalogRecipeCoverStyle } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import type { RecipeIngredientKind } from "@/modules/recipes/core/domain/recipe.types";

export type RecipeRow = {
  id: string;
  project_id: string;
  title: string;
  summary: string;
  total_time_minutes: number | null;
  total_time_label: string;
  servings_count: number | null;
  servings_label: string;
  note: string | null;
  cover_image_url: string | null;
  cover_style: CatalogRecipeCoverStyle;
  created_at: string;
  updated_at: string;
};

export type RecipeStepRow = {
  id: string;
  project_id: string;
  recipe_id: string;
  position: number;
  title: string | null;
  instruction: string;
  notes: string | null;
  meta: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeIngredientRow = {
  id: string;
  project_id: string;
  recipe_id: string;
  position: number;
  display_name: string;
  normalized_name: string;
  amount_value: number | null;
  amount_text: string | null;
  unit: string | null;
  notes: string | null;
  kind: RecipeIngredientKind;
  created_at: string;
  updated_at: string;
};

export type RecipeTagRow = {
  id: string;
  project_id: string;
  label: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type RecipeTagLinkRow = {
  project_id: string;
  recipe_id: string;
  tag_id: string;
  created_at: string;
};

export type RecipeSelectionRow = {
  id: string;
  project_id: string;
  recipe_id: string;
  position: number;
  note: string | null;
  servings_count: number | null;
  servings_label: string;
  created_at: string;
  updated_at: string;
};

export type ShoppingListRow = {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
};

export type ShoppingListRecipeSourceRow = {
  recipeId: string;
  title: string;
};

export type ShoppingListItemRow = {
  id: string;
  project_id: string;
  shopping_list_id: string;
  group_id: string;
  group_title: string;
  position: number;
  display_name: string;
  normalized_name: string;
  amount_value: number | null;
  amount_text: string | null;
  unit: string | null;
  notes: string | null;
  ingredient_kind: RecipeIngredientKind;
  checked: boolean;
  recipe_sources: unknown;
  created_at: string;
  updated_at: string;
};
