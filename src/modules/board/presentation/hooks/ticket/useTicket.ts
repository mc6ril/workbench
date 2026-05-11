import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import { getTicketDetail } from "@/modules/board/core/usecases/ticket/getTicketDetail";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for fetching a single ticket by ID.
 * Seeds initial data from the ticket list cache when available,
 * avoiding a redundant DB fetch when the board was already loaded.
 *
 * @param ticketId - Ticket ID
 */
export const useTicket = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => getTicketDetail(ticketRepository, ticketId),
    enabled: !!ticketId,
    initialData: () => {
      for (const query of queryClient.getQueryCache().getAll()) {
        const data = query.state.data;
        if (!Array.isArray(data)) continue;
        const ticket = (data as Ticket[]).find((t) => t.id === ticketId);
        if (ticket) return ticket;
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      for (const query of queryClient.getQueryCache().getAll()) {
        const data = query.state.data;
        if (!Array.isArray(data)) continue;
        if ((data as Ticket[]).some((t) => t.id === ticketId)) {
          return query.state.dataUpdatedAt;
        }
      }
      return undefined;
    },
  });
};
