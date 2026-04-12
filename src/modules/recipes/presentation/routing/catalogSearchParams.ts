import type { ReadonlyURLSearchParams } from "next/navigation";

import { normalizeCatalogRecipeSearch } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import {
  type CatalogRecipeFilterOptionId,
  normalizeCatalogRecipeFilterOptionIds,
} from "@/modules/recipes/core/domain/catalog/catalogRecipeFilters";

type SearchParamsLike =
  | URLSearchParams
  | ReadonlyURLSearchParams
  | Record<string, string | string[] | undefined>;

const hasSearchParamsGetter = (
  searchParams: SearchParamsLike
): searchParams is URLSearchParams | ReadonlyURLSearchParams => {
  return "get" in searchParams;
};

export type RecipesCatalogQueryState = {
  search: string;
  filterOptionIds: CatalogRecipeFilterOptionId[];
};

const readValue = (
  searchParams: SearchParamsLike,
  key: "q" | "filters" | "tags"
): string | null => {
  if (hasSearchParamsGetter(searchParams)) {
    return searchParams.get(key);
  }

  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

export const parseRecipesCatalogSearchParams = (
  searchParams: SearchParamsLike
): RecipesCatalogQueryState => {
  const search = normalizeCatalogRecipeSearch(readValue(searchParams, "q"));
  const filterValues =
    readValue(searchParams, "filters") ?? readValue(searchParams, "tags");

  return {
    search,
    filterOptionIds: normalizeCatalogRecipeFilterOptionIds(
      filterValues?.split(",") ?? []
    ),
  };
};

export const buildRecipesCatalogSearchParams = (
  queryState: RecipesCatalogQueryState
): URLSearchParams => {
  const searchParams = new URLSearchParams();
  const search = normalizeCatalogRecipeSearch(queryState.search);
  const filterOptionIds = normalizeCatalogRecipeFilterOptionIds(
    queryState.filterOptionIds
  );

  if (search) {
    searchParams.set("q", search);
  }

  if (filterOptionIds.length > 0) {
    searchParams.set("filters", filterOptionIds.join(","));
  }

  return searchParams;
};
