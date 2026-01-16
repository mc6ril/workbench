import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reorderTicket } from "@/core/usecases/ticket/reorderTicket";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

type ReorderTicketVariables = {
  projectId: string;
  ticketPositions: Array<{ id: string; position: number }>;
};

/**
 * Hook for reordering tickets (bulk position update).
 * Invalidates the project tickets root on success.
 */
export const useReorderTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketPositions }: ReorderTicketVariables) =>
      reorderTicket(ticketRepository, { ticketPositions }),
    onSuccess: (_tickets, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(variables.projectId),
      });
    },
  });
};

