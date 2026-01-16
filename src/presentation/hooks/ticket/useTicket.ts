import { useQuery } from "@tanstack/react-query";

import { getTicketDetail } from "@/core/usecases/ticket/getTicketDetail";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching a single ticket by ID.
 *
 * @param ticketId - Ticket ID
 */
export const useTicket = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => getTicketDetail(ticketRepository, ticketId),
    enabled: !!ticketId,
  });
};

