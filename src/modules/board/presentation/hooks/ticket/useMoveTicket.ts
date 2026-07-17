import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { BoardConfiguration } from "@/modules/board/core/domain/board.types";
import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import { moveTicket } from "@/modules/board/core/usecases/ticket/moveTicket";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
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
    mutationFn: ({
      projectId,
      ticketId,
      columnId,
      position,
    }: MoveTicketVariables) => {
      // The board's columns are already cached (staleTime: Infinity) from the
      // board view — read them instead of re-fetching to resolve `completedAt`.
      const boardConfig = queryClient.getQueryData<BoardConfiguration>(
        queryKeys.projects.boardConfiguration(projectId)
      );
      return moveTicket(
        ticketRepository,
        ticketId,
        columnId,
        position,
        boardConfig?.columns ?? []
      );
    },
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

            const byId = new Map(
              ticketsInStatus.map((ticket) => [ticket.id, ticket])
            );
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
