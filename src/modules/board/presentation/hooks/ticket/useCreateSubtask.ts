import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateSubtaskInput } from "@/modules/board/core/domain/schema/ticket.schema";
import { createSubtask } from "@/modules/board/core/usecases/ticket/createSubtask";
import {
  boardRepository,
  ticketRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for creating a subtask.
 * Invalidates the project tickets root on success.
 */
export const useCreateSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubtaskInput) =>
      createSubtask(ticketRepository, boardRepository, input),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(ticket.projectId),
      });
    },
  });
};
