"use client";

import type { QueryClient } from "@tanstack/react-query";

import { regenerateShoppingListAction } from "@/modules/recipes/presentation/actions/shopping";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const invalidatePlannerMutation = (
  queryClient: QueryClient,
  projectId: string
) => {
  void queryClient.invalidateQueries({
    queryKey: recipesQueryKeys.planner.quickList(projectId),
    refetchType: "active",
  });

  void regenerateShoppingListAction(projectId).finally(() => {
    void queryClient.invalidateQueries({
      queryKey: recipesQueryKeys.shopping.list(projectId),
      refetchType: "active",
    });
  });
};
