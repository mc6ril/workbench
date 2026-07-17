import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { BoardConfiguration } from "@/modules/board/core/domain/board.types";
import type { CreateTicketInput } from "@/modules/board/core/domain/ticket.types";
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
    mutationFn: (input: CreateTicketInput) => {
      // The board's columns are already cached (staleTime: Infinity) from the
      // board view — read them instead of re-fetching to resolve `completedAt`.
      const boardConfig = queryClient.getQueryData<BoardConfiguration>(
        queryKeys.projects.boardConfiguration(input.projectId)
      );
      return createTicket(ticketRepository, input, boardConfig?.columns ?? []);
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(ticket.projectId),
      });
    },
  });
};
