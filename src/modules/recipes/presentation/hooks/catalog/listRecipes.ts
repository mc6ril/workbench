"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import type {
  CatalogRecipeListCursor,
  CatalogRecipeListFilters,
  CatalogRecipeListResponse,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { listCatalogRecipes } from "@/modules/recipes/core/usecases/catalog/listCatalogRecipes";
import { catalogRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useListRecipes = (
  projectId: string,
  filters?: CatalogRecipeListFilters,
  options?: {
    enabled?: boolean;
    initialData?: CatalogRecipeListResponse;
  }
) => {
  const query = useInfiniteQuery({
    queryKey: recipesQueryKeys.catalog.infinite(projectId, filters),
    queryFn: ({ pageParam }) =>
      listCatalogRecipes({
        catalogRepository,
      })({
        projectId,
        filters,
        pagination: pageParam ? { cursor: pageParam } : undefined,
      }),
    initialPageParam: null as CatalogRecipeListCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!projectId && (options?.enabled ?? true),
    initialData: options?.initialData
      ? {
          pages: [options.initialData],
          pageParams: [null],
        }
      : undefined,
  });

  return {
    ...query,
    recipes: query.data?.pages.flatMap((page) => page.items) ?? [],
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
};
