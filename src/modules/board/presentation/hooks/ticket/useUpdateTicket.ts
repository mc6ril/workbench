import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateTicketInput } from "@/modules/board/core/domain/schema/ticket.schema";
import { updateTicket } from "@/modules/board/core/usecases/ticket/updateTicket";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

type UpdateTicketVariables = {
  id: string;
  input: UpdateTicketInput;
};

/**
 * Hook for updating a ticket.
 * Invalidates the project tickets root and the ticket detail on success.
 */
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateTicketVariables) =>
      updateTicket(ticketRepository, id, input),
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

