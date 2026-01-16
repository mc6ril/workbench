import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteTicket } from "@/core/usecases/ticket/deleteTicket";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

type DeleteTicketVariables = {
  projectId: string;
  ticketId: string;
};

/**
 * Hook for deleting a ticket.
 * Invalidates the project tickets root on success.
 *
 * Note: `projectId` is required for reliable invalidation without extra fetches.
 */
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId }: DeleteTicketVariables) =>
      deleteTicket(ticketRepository, ticketId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(variables.projectId),
      });
    },
  });
};

