import { useMemo } from "react";
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
  const stableTicketIds = useMemo(() => [...ticketIds].sort(), [ticketIds]);
  const hasIds = stableTicketIds.length > 0;

  return useQuery<Record<string, TicketAssignee[]>>({
    queryKey: queryKeys.tickets.assigneesByTicketIds(stableTicketIds),
    queryFn: () =>
      getTicketAssigneesByTicketIds(ticketRepository, stableTicketIds),
    enabled: hasIds,
  });
};
