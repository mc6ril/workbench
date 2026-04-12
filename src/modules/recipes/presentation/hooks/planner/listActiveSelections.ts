"use client";

import { useQuery } from "@tanstack/react-query";

import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { plannerRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useListActiveSelections = (
  projectId: string,
  options?: {
    enabled?: boolean;
    initialData?: QuickListRecipe[];
  }
) => {
  return useQuery({
    queryKey: recipesQueryKeys.planner.quickList(projectId),
    queryFn: () =>
      listActiveSelections({
        plannerRepository,
      })(projectId),
    enabled: !!projectId && (options?.enabled ?? true),
    initialData: options?.initialData,
  });
};
