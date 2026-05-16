"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MarkShoppingDoneInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import { markShoppingDone } from "@/modules/recipes/core/usecases/planner/markShoppingDone";
import { plannerRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { invalidatePlannerMutation } from "@/modules/recipes/presentation/hooks/planner/utils/invalidatePlannerMutation";

export const useMarkShoppingDone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MarkShoppingDoneInput) =>
      markShoppingDone({
        plannerRepository,
      })(input),
    onSuccess: (_selection, variables) =>
      invalidatePlannerMutation(queryClient, variables.projectId),
  });
};
