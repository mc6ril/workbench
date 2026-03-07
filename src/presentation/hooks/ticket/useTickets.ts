import { useQuery } from "@tanstack/react-query";

import type {
  TicketFilters,
  TicketSort,
} from "@/core/domain/schema/ticket.schema";

import { listTickets } from "@/core/usecases/ticket/listTickets";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching tickets for a project.
 *
 * @param projectId - Project ID
 * @param filters - Optional filters (status, epicId, parentId)
 * @param sort - Optional sort configuration
 * @param search - Optional server-side search term
 * @param options - Query options (enabled, limit)
 */
export const useTickets = (
  projectId: string,
  filters?: TicketFilters,
  sort?: TicketSort,
  search?: string,
  options?: { enabled?: boolean; limit?: number }
) => {
  const limit = options?.limit;

  return useQuery({
    queryKey: queryKeys.projects.ticketsList(
      projectId,
      filters,
      sort,
      search,
      limit
    ),
    queryFn: () =>
      listTickets(ticketRepository, projectId, filters, sort, search, limit),
    enabled: !!projectId && (options?.enabled ?? true),
  });
};
