import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateSubtaskInput } from "@/core/domain/schema/ticket.schema";

import { createSubtask } from "@/core/usecases/ticket/createSubtask";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for creating a subtask.
 * Invalidates the project tickets root on success.
 */
export const useCreateSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubtaskInput) =>
      createSubtask(ticketRepository, input),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(ticket.projectId),
      });
    },
  });
};

