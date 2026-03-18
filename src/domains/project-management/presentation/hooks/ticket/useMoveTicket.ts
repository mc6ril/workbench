import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Ticket } from "@/domains/project-management/core/domain/schema/ticket.schema";

import { moveTicket } from "@/domains/project-management/core/usecases/ticket/moveTicket";

import { ticketRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

type MoveTicketVariables = {
  projectId: string;
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
    onMutate: async ({ projectId, ticketId, status, position }) => {
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
              status,
              position,
            };
          });

          const statusesToNormalize = new Set([movedTicket.status, status]);
          let normalizedTickets = nextTickets;

          for (const targetStatus of statusesToNormalize) {
            const ticketsInStatus = normalizedTickets
              .filter((ticket) => ticket.status === targetStatus)
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

