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

export type CatalogRecipeListFilters = {
  search?: string;
  tagSlugs?: string[];
};

export type CatalogRecipeListInput = {
  projectId: string;
  filters?: CatalogRecipeListFilters;
};

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

export const normalizeCatalogRecipeSearch = (
  value: string | null | undefined
): string => {
  return value?.trim() ?? "";
};

export const normalizeCatalogRecipeTagSlugs = (
  value: string[] | null | undefined
): string[] => {
  if (!value || value.length === 0) {
    return [];
  }

  return [...new Set(value.map((slug) => slug.trim()).filter(Boolean))].sort();
};

export const normalizeCatalogRecipeListFilters = (
  filters?: CatalogRecipeListFilters
): Required<CatalogRecipeListFilters> => {
  return {
    search: normalizeCatalogRecipeSearch(filters?.search),
    tagSlugs: normalizeCatalogRecipeTagSlugs(filters?.tagSlugs),
  };
};
