import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import { reorderTicket } from "@/modules/board/core/usecases/ticket/reorderTicket";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

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
    onMutate: async ({ projectId, ticketPositions }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
      });

      const previousTicketLists = queryClient.getQueriesData<Ticket[]>({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
      });

      const positionById = new Map(
        ticketPositions.map((ticketPosition) => [
          ticketPosition.id,
          ticketPosition.position,
        ])
      );

      queryClient.setQueriesData<Ticket[]>(
        { queryKey: queryKeys.projects.ticketsRoot(projectId) },
        (previous) => {
          if (!Array.isArray(previous)) {
            return previous;
          }

          return previous.map((ticket) => {
            const nextPosition = positionById.get(ticket.id);
            if (nextPosition == null) {
              return ticket;
            }

            return {
              ...ticket,
              position: nextPosition,
            };
          });
        }
      );

      return {
        previousTicketLists,
      };
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, data] of context?.previousTicketLists ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: (_tickets, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(variables.projectId),
      });
    },
  });
};
