import { useMutation, useQueryClient } from "@tanstack/react-query";

import { startSprint } from "@/domains/project-management/core/usecases/sprint";

import { sprintRepository } from "@/domains/project-management/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

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
