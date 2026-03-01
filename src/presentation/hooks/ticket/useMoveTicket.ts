import { useMutation, useQueryClient } from "@tanstack/react-query";

import { moveTicket } from "@/core/usecases/ticket/moveTicket";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

type MoveTicketVariables = {
  ticketId: string;
  status: string;
  position: number;
};

/**
 * Hook for moving a ticket to a new status and position.
 * Invalidates the project tickets root and the ticket detail on success.
 */
export const useMoveTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, status, position }: MoveTicketVariables) =>
      moveTicket(ticketRepository, ticketId, status, position),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(ticket.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticket.id),
      });
    },
  });
};

