import type { ReadonlyURLSearchParams } from "next/navigation";

import {
  normalizeCatalogRecipeSearch,
  normalizeCatalogRecipeTagSlugs,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";

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
  tagSlugs: string[];
};

const readValue = (
  searchParams: SearchParamsLike,
  key: "q" | "tags"
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
  const tagsValue = readValue(searchParams, "tags");

  return {
    search,
    tagSlugs: normalizeCatalogRecipeTagSlugs(tagsValue?.split(",") ?? []),
  };
};

export const buildRecipesCatalogSearchParams = (
  queryState: RecipesCatalogQueryState
): URLSearchParams => {
  const searchParams = new URLSearchParams();
  const search = normalizeCatalogRecipeSearch(queryState.search);
  const tagSlugs = normalizeCatalogRecipeTagSlugs(queryState.tagSlugs);

  if (search) {
    searchParams.set("q", search);
  }

  if (tagSlugs.length > 0) {
    searchParams.set("tags", tagSlugs.join(","));
  }

  return searchParams;
};
