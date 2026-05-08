import { APP_LIMITS } from "@/shared/constants/app";

import {
  type CatalogRecipeFilterOptionId,
  normalizeCatalogRecipeFilterOptionIds,
} from "@/modules/recipes/core/domain/catalog/catalogRecipeFilters";
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

export const isCatalogRecipeCoverStyle = (
  value: string
): value is CatalogRecipeCoverStyle => {
  return (CATALOG_RECIPE_COVER_STYLE_VALUES as readonly string[]).includes(
    value
  );
};

export type CatalogRecipeTag = RecipeTag;

export type CatalogRecipeListFilters = {
  search?: string;
  filterOptionIds?: CatalogRecipeFilterOptionId[];
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
  | "id"
  | "title"
  | "summary"
  | "totalTimeLabel"
  | "servingsLabel"
  | "coverImageUrl"
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

export const normalizeCatalogRecipeListFilters = (
  filters?: CatalogRecipeListFilters
): Required<CatalogRecipeListFilters> => {
  return {
    search: normalizeCatalogRecipeSearch(filters?.search),
    filterOptionIds: normalizeCatalogRecipeFilterOptionIds(
      filters?.filterOptionIds
    ),
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
