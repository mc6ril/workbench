import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteLabel } from "@/core/usecases/label";

import { labelRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for deleting a label.
 */
export const useDeleteLabel = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => deleteLabel(labelId, labelRepository),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.labels.byProject(projectId),
      });
    },
  });
};
