import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";

import { moveAndReorderTicket } from "@/modules/board/core/usecases/ticket/moveAndReorderTicket";

import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

type MoveAndReorderTicketVariables = {
  projectId: string;
  ticketId: string;
  status: string;
  position: number;
  ticketPositions: Array<{ id: string; position: number }>;
};

export const useMoveAndReorderTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      status,
      position,
      ticketPositions,
    }: MoveAndReorderTicketVariables) =>
      moveAndReorderTicket(ticketRepository, {
        ticketId,
        status,
        position,
        ticketPositions,
      }),
    onMutate: async ({
      projectId,
      ticketId,
      status,
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
              status: ticket.id === ticketId ? status : ticket.status,
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
