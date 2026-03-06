import { useQuery } from "@tanstack/react-query";

import type { TicketAssignee } from "@/core/domain/schema/ticket.schema";

import { getTicketAssigneesByTicketIds } from "@/core/usecases/ticket/getTicketAssigneesByTicketIds";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching assignees for a set of tickets.
 *
 * @param ticketIds - Ticket IDs to load assignees for
 * @returns Record keyed by ticketId
 */
export const useTicketAssigneesByTicketIds = (ticketIds: string[]) => {
  return useQuery<Record<string, TicketAssignee[]>>({
    queryKey: queryKeys.tickets.assigneesByTicketIds(ticketIds),
    queryFn: () => getTicketAssigneesByTicketIds(ticketRepository, ticketIds),
    enabled: ticketIds.length > 0,
  });
};
