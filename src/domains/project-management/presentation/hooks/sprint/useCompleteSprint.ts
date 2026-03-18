import { useMutation, useQueryClient } from "@tanstack/react-query";

import { completeSprint } from "@/domains/project-management/core/usecases/sprint";

import { sprintRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

/**
 * Hook for completing an active sprint.
 */
export const useCompleteSprint = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) =>
      completeSprint(sprintId, sprintRepository),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sprints.byProject(projectId),
      });
    },
  });
};
