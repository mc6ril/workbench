import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateLabelInput } from "@/core/domain/schema/label.schema";

import { createLabel } from "@/core/usecases/label";

import { labelRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for creating a label.
 */
export const useCreateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLabelInput) =>
      createLabel(input, labelRepository),
    onSuccess: (label) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.labels.byProject(label.projectId),
      });
    },
  });
};
