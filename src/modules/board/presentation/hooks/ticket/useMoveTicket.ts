import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import { moveTicket } from "@/modules/board/core/usecases/ticket/moveTicket";
import {
  boardRepository,
  ticketRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

type MoveTicketVariables = {
  projectId: string;
  ticketId: string;
  columnId: string;
  position: number;
};

/**
 * Hook for moving a ticket to a new column and position.
 * Invalidates the project tickets root and the ticket detail on success.
 */
export const useMoveTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, columnId, position }: MoveTicketVariables) =>
      moveTicket(
        ticketRepository,
        boardRepository,
        ticketId,
        columnId,
        position
      ),
    onMutate: async ({ projectId, ticketId, columnId, position }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
      });

      const previousTicketLists = queryClient.getQueriesData<Ticket[]>({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
      });

      queryClient.setQueriesData<Ticket[]>(
        { queryKey: queryKeys.projects.ticketsRoot(projectId) },
        (previous) => {
          if (!Array.isArray(previous)) {
            return previous;
          }

          const movedTicket = previous.find((ticket) => ticket.id === ticketId);
          if (movedTicket == null) {
            return previous;
          }

          const nextTickets = previous.map((ticket) => {
            if (ticket.id !== ticketId) {
              return ticket;
            }

            return {
              ...ticket,
              columnId,
              position,
            };
          });

          const columnIdsToNormalize = new Set([
            movedTicket.columnId,
            columnId,
          ]);
          let normalizedTickets = nextTickets;

          for (const targetColumnId of columnIdsToNormalize) {
            const ticketsInStatus = normalizedTickets
              .filter((ticket) => ticket.columnId === targetColumnId)
              .sort((a, b) => a.position - b.position)
              .map((ticket, index) => ({
                ...ticket,
                position: index,
              }));

            const byId = new Map(ticketsInStatus.map((ticket) => [ticket.id, ticket]));
            normalizedTickets = normalizedTickets.map((ticket) => {
              return byId.get(ticket.id) ?? ticket;
            });
          }

          return normalizedTickets;
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
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticket.id),
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(variables.projectId),
      });
    },
  });
};
