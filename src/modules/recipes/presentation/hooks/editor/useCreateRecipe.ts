"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SaveRecipeEditorInput } from "@/modules/recipes/core/domain/editor/recipeEditor.types";
import { createRecipe } from "@/modules/recipes/core/usecases/editor/createRecipe";
import { editorRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveRecipeEditorInput) =>
      createRecipe({
        editorRepository,
      })(input),
    onSuccess: (_recipe, variables) => {
      queryClient.invalidateQueries({
        queryKey: recipesQueryKeys.root(variables.projectId),
      });
    },
  });
};
