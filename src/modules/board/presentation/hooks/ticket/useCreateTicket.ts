import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateTicketInput } from "@/modules/board/core/domain/schema/ticket.schema";

import { createTicket } from "@/modules/board/core/usecases/ticket/createTicket";

import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for creating a ticket.
 * Invalidates the project tickets root on success.
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTicketInput) =>
      createTicket(ticketRepository, input),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(ticket.projectId),
      });

      if (ticket.epicId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.epicsRoot(ticket.projectId),
        });
      }
    },
  });
};

