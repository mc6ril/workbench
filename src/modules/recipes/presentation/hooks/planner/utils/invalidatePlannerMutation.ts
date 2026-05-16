"use client";

import type { QueryClient } from "@tanstack/react-query";

import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const invalidatePlannerMutation = (
  queryClient: QueryClient,
  projectId: string
) => {
  void queryClient.invalidateQueries({
    queryKey: recipesQueryKeys.planner.quickList(projectId),
    refetchType: "active",
  });
};
