"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SaveRecipeEditorInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import { updateRecipe } from "@/modules/recipes/core/usecases/editor/updateRecipe";
import { editorRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

type UpdateRecipeMutationInput = SaveRecipeEditorInput & {
  recipeId: string;
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRecipeMutationInput) =>
      updateRecipe({
        editorRepository,
      })(input),
    onSuccess: (_recipe, variables) => {
      queryClient.invalidateQueries({
        queryKey: recipesQueryKeys.root(variables.projectId),
      });
    },
  });
};
