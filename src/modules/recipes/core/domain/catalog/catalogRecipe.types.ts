import { APP_LIMITS } from "@/shared/constants/app";

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

export type CatalogRecipeListCursor = {
  updatedAt: string;
  id: string;
};

export type CatalogRecipeListPaginationInput = {
  cursor?: CatalogRecipeListCursor | null;
  pageSize?: number;
};

export type CatalogRecipeListPagination = {
  cursor: CatalogRecipeListCursor | null;
  pageSize: number;
};

export type CatalogRecipeListInput = {
  projectId: string;
  filters?: CatalogRecipeListFilters;
  pagination?: CatalogRecipeListPaginationInput;
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

export type CatalogRecipeListResponse = {
  items: CatalogRecipeSummary[];
  nextCursor: CatalogRecipeListCursor | null;
  hasMore: boolean;
};

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

export const normalizeCatalogRecipeListPagination = (
  pagination?: CatalogRecipeListPaginationInput
): CatalogRecipeListPagination => {
  const requestedPageSize = pagination?.pageSize;
  const pageSize =
    typeof requestedPageSize === "number" && Number.isFinite(requestedPageSize)
      ? Math.trunc(requestedPageSize)
      : APP_LIMITS.PAGINATION.DEFAULT_PAGE_SIZE;

  return {
    cursor: pagination?.cursor ?? null,
    pageSize: Math.min(
      Math.max(pageSize, 1),
      APP_LIMITS.PAGINATION.MAX_PAGE_SIZE
    ),
  };
};
