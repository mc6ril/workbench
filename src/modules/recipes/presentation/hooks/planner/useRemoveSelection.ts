"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RemoveSelectionInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import { removeSelection } from "@/modules/recipes/core/usecases/planner/removeSelection";
import { plannerRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useRemoveSelection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RemoveSelectionInput) =>
      removeSelection({
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
