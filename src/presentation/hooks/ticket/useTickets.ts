import { useQuery } from "@tanstack/react-query";

import type { TicketFilters, TicketSort } from "@/core/domain/schema/ticket.schema";

import { listTickets } from "@/core/usecases/ticket/listTickets";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching tickets for a project.
 *
 * @param projectId - Project ID
 * @param filters - Optional filters (status, epicId, parentId)
 * @param sort - Optional sort configuration
 */
export const useTickets = (
  projectId: string,
  filters?: TicketFilters,
  sort?: TicketSort
) => {
  return useQuery({
    queryKey: queryKeys.projects.ticketsList(projectId, filters, sort),
    queryFn: () => listTickets(ticketRepository, projectId, filters, sort),
    enabled: !!projectId,
  });
};

