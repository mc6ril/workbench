"use client";

import { useQuery } from "@tanstack/react-query";

import type { CatalogRecipeTag } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { listCatalogRecipeTags } from "@/modules/recipes/core/usecases/catalog/listCatalogRecipeTags";
import { catalogRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useListRecipeTags = (
  projectId: string,
  options?: {
    enabled?: boolean;
    initialData?: CatalogRecipeTag[];
  }
) => {
  return useQuery({
    queryKey: recipesQueryKeys.catalog.tags(projectId),
    queryFn: () =>
      listCatalogRecipeTags({
        catalogRepository,
      })(projectId),
    enabled: !!projectId && (options?.enabled ?? true),
    initialData: options?.initialData,
  });
};
