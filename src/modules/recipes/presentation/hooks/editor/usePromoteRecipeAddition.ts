"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PromoteRecipeAdditionInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import { promoteRecipeAddition } from "@/modules/recipes/core/usecases/editor/promoteRecipeAddition";
import {
  editorRepository,
  shoppingRepository,
} from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const usePromoteRecipeAddition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PromoteRecipeAdditionInput) =>
      promoteRecipeAddition({
        editorRepository,
        shoppingRepository,
      })(input),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: recipesQueryKeys.root(variables.projectId),
      });
    },
  });
};
