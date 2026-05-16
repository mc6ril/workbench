"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RemoveSelectionInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import { removeSelection } from "@/modules/recipes/core/usecases/planner/removeSelection";
import { plannerRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { invalidatePlannerMutation } from "@/modules/recipes/presentation/hooks/planner/utils/invalidatePlannerMutation";

export const useRemoveSelection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RemoveSelectionInput) =>
      removeSelection({
        plannerRepository,
      })(input),
    onSuccess: (_result, variables) =>
      invalidatePlannerMutation(queryClient, variables.projectId),
  });
};
