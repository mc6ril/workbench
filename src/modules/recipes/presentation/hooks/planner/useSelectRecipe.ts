"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SelectRecipeInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import { selectRecipe } from "@/modules/recipes/core/usecases/planner/selectRecipe";
import { plannerRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useSelectRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SelectRecipeInput) =>
      selectRecipe({
        plannerRepository,
      })(input),
    onSuccess: (_selection, variables) => {
      queryClient.invalidateQueries({
        queryKey: recipesQueryKeys.root(variables.projectId),
      });
    },
  });
};
