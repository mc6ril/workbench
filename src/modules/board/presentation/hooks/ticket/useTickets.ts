import { useQuery } from "@tanstack/react-query";

import type { TicketFilters } from "@/modules/board/core/domain/ticket.types";
import { listTickets } from "@/modules/board/core/usecases/ticket/listTickets";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for fetching tickets for a project.
 *
 * @param projectId - Project ID
 * @param filters - Optional filters (status, priority)
 * @param search - Optional server-side search term
 * @param options - Query options (enabled, limit)
 */
export const useTickets = (
  projectId: string,
  filters?: TicketFilters,
  search?: string,
  options?: {
    enabled?: boolean;
    limit?: number;
  }
) => {
  const limit = options?.limit;

  return useQuery({
    queryKey: queryKeys.projects.ticketsList(
      projectId,
      filters,
      search,
      limit
    ),
    queryFn: () => listTickets(ticketRepository, projectId, filters, search, limit),
    enabled: !!projectId && (options?.enabled ?? true),
  });
};
