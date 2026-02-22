import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSprint } from "@/core/usecases/sprint";

import { sprintRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for deleting a sprint.
 * Tickets in the sprint will return to the backlog.
 */
export const useDeleteSprint = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => deleteSprint(sprintId, sprintRepository),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sprints.byProject(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
      });
    },
  });
};
