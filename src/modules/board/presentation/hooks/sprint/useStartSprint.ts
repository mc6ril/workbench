import { useMutation, useQueryClient } from "@tanstack/react-query";

import { startSprint } from "@/modules/board/core/usecases/sprint";
import { sprintRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for starting a planned sprint.
 */
export const useStartSprint = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => startSprint(sprintId, sprintRepository),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sprints.byProject(projectId),
      });
    },
  });
};
