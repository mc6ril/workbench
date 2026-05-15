"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MarkAsCookedInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import { markAsCooked } from "@/modules/recipes/core/usecases/planner/markAsCooked";
import { plannerRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useMarkAsCooked = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MarkAsCookedInput) =>
      markAsCooked({
        plannerRepository,
      })(input),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: recipesQueryKeys.planner.quickList(variables.projectId),
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: recipesQueryKeys.shopping.list(variables.projectId),
        refetchType: "active",
      });
    },
  });
};
