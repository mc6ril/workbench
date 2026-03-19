import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteLabel } from "@/modules/board/core/usecases/label";
import { labelRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

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
