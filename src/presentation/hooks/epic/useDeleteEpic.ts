import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteEpic } from "@/core/usecases/epic/deleteEpic";

import { epicRepository, ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

type DeleteEpicVariables = {
  projectId: string;
  epicId: string;
};

/**
 * Hook for deleting an epic.
 * Invalidates project epics root and project tickets root on success.
 *
 * Note: `projectId` is required for reliable invalidation without extra fetches.
 */
export const useDeleteEpic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ epicId }: DeleteEpicVariables) =>
      deleteEpic(epicRepository, ticketRepository, epicId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.epicsRoot(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(variables.projectId),
      });
    },
  });
};

