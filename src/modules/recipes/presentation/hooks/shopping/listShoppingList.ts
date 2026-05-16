"use client";

import { useQuery } from "@tanstack/react-query";

import type { ShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import { getShoppingList } from "@/modules/recipes/core/usecases/shopping/getShoppingList";
import { shoppingRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useListShoppingList = (
  projectId: string,
  options?: {
    enabled?: boolean;
    initialData?: ShoppingList;
  }
) => {
  return useQuery({
    queryKey: recipesQueryKeys.shopping.list(projectId),
    queryFn: () =>
      getShoppingList({
        shoppingRepository,
      })(projectId),
    staleTime: Infinity,
    enabled: !!projectId && (options?.enabled ?? true),
    initialData: options?.initialData,
  });
};
