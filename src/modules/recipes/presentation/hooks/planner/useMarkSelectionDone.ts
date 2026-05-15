"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MarkSelectionDoneInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import { markSelectionDone } from "@/modules/recipes/core/usecases/planner/markSelectionDone";
import { plannerRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useMarkSelectionDone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MarkSelectionDoneInput) =>
      markSelectionDone({
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
