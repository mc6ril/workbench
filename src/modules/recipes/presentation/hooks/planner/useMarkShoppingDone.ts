"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MarkShoppingDoneInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import { markShoppingDone } from "@/modules/recipes/core/usecases/planner/markShoppingDone";
import { plannerRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useMarkShoppingDone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MarkShoppingDoneInput) =>
      markShoppingDone({
        plannerRepository,
      })(input),
    onSuccess: (_selection, variables) => {
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
