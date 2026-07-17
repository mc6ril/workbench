import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { BoardConfiguration } from "@/modules/board/core/domain/board.types";
import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import { moveAndReorderTicket } from "@/modules/board/core/usecases/ticket/moveAndReorderTicket";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

type MoveAndReorderTicketVariables = {
  projectId: string;
  ticketId: string;
  columnId: string;
  position: number;
  ticketPositions: Array<{ id: string; position: number }>;
};

export const useMoveAndReorderTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      ticketId,
      columnId,
      position,
      ticketPositions,
    }: MoveAndReorderTicketVariables) => {
      // The board's columns are already cached (staleTime: Infinity) from the
      // board view — read them instead of re-fetching to resolve `completedAt`.
      const boardConfig = queryClient.getQueryData<BoardConfiguration>(
        queryKeys.projects.boardConfiguration(projectId)
      );
      return moveAndReorderTicket(
        ticketRepository,
        { ticketId, columnId, position, ticketPositions },
        boardConfig?.columns ?? []
      );
    },
    onMutate: async ({
      projectId,
      ticketId,
      columnId,
      position,
      ticketPositions,
    }) => {
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
            if (ticket.id !== ticketId && nextPosition == null) {
              return ticket;
            }

            return {
              ...ticket,
              columnId: ticket.id === ticketId ? columnId : ticket.columnId,
              position:
                ticket.id === ticketId
                  ? position
                  : (nextPosition ?? ticket.position),
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(variables.ticketId),
      });
    },
  });
};
