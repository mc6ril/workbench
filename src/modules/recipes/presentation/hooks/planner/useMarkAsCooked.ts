"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MarkAsCookedInput } from "@/modules/recipes/core/domain/planner/quickList.types";
import { markAsCooked } from "@/modules/recipes/core/usecases/planner/markAsCooked";
import { plannerRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { invalidatePlannerMutation } from "@/modules/recipes/presentation/hooks/planner/utils/invalidatePlannerMutation";

export const useMarkAsCooked = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MarkAsCookedInput) =>
      markAsCooked({
        plannerRepository,
      })(input),
    onSuccess: (_result, variables) =>
      invalidatePlannerMutation(queryClient, variables.projectId),
  });
};
