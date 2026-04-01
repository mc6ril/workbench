import type {
  Recipe,
  RecipeTag,
} from "@/modules/recipes/core/domain/recipe.types";

export const CATALOG_RECIPE_COVER_STYLE_VALUES = [
  "citrus",
  "tomato",
  "green",
  "gold",
  "plum",
  "neutral",
  "sage",
] as const;

export type CatalogRecipeCoverStyle =
  (typeof CATALOG_RECIPE_COVER_STYLE_VALUES)[number];

export type CatalogRecipeTag = RecipeTag;

export type CatalogRecipeSummary = Pick<
  Recipe,
  "id" | "title" | "summary" | "totalTimeLabel" | "servingsLabel"
> & {
  tags: CatalogRecipeTag[];
  coverStyle: CatalogRecipeCoverStyle;
  isInQuickList: boolean;
};

export type CatalogRecipeDetail = CatalogRecipeSummary &
  Pick<Recipe, "note" | "ingredients" | "steps">;
