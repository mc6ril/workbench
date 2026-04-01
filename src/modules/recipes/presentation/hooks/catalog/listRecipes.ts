"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  CatalogRecipeListFilters,
  CatalogRecipeSummary,
} from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { listCatalogRecipes } from "@/modules/recipes/core/usecases/catalog/listCatalogRecipes";
import { catalogRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useListRecipes = (
  projectId: string,
  filters?: CatalogRecipeListFilters,
  options?: {
    enabled?: boolean;
    initialData?: CatalogRecipeSummary[];
  }
) => {
  return useQuery({
    queryKey: recipesQueryKeys.catalog.list(projectId, filters),
    queryFn: () =>
      listCatalogRecipes({
        catalogRepository,
      })({
        projectId,
        filters,
      }),
    enabled: !!projectId && (options?.enabled ?? true),
    initialData: options?.initialData,
    placeholderData: (previousData) => previousData,
  });
};
