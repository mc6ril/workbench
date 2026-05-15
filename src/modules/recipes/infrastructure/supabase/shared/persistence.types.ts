import type { TableRow } from "@/shared/infrastructure/supabase/types";

export type RecipeRow = TableRow<"recipes">;
export type RecipeStepRow = TableRow<"recipe_steps">;
export type RecipeIngredientRow = TableRow<"recipe_ingredients">;
export type RecipeTagRow = TableRow<"recipe_tags">;
export type RecipeTagLinkRow = TableRow<"recipe_tag_links">;
export type RecipeSelectionRow = TableRow<"recipe_selections">;
export type RecipeCookingHistoryRow = TableRow<"recipe_cooking_history">;
export type ShoppingListRow = TableRow<"shopping_lists">;

export type ShoppingListRecipeSourceJson = {
  recipeId: string;
  title: string;
};

export type ShoppingListItemRow = TableRow<"shopping_list_items">;
