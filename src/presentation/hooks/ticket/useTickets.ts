import { useQuery } from "@tanstack/react-query";

import type {
  Ticket,
  TicketFilters,
  TicketSort,
} from "@/core/domain/schema/ticket.schema";

import { listTickets } from "@/core/usecases/ticket/listTickets";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

const hasParentIdFilter = (
  filters?: TicketFilters
): filters is TicketFilters & { parentId: string | null } => {
  return (
    filters != null && Object.prototype.hasOwnProperty.call(filters, "parentId")
  );
};

const omitParentIdFilter = (
  filters?: TicketFilters
): TicketFilters | undefined => {
  if (!hasParentIdFilter(filters)) {
    return filters;
  }

  const { parentId: _parentId, ...rest } = filters;
  return rest;
};

const applyParentIdFilter = (
  tickets: Ticket[],
  parentId: string | null
): Ticket[] => {
  if (parentId === null) {
    return tickets.filter((ticket) => ticket.parentId === null);
  }

  return tickets.filter((ticket) => ticket.parentId === parentId);
};

/**
 * Hook for fetching tickets for a project.
 *
 * @param projectId - Project ID
 * @param filters - Optional filters (status, epicId, parentId)
 * @param sort - Optional sort configuration
 * @param search - Optional server-side search term
 * @param options - Query options (enabled, limit, useProjectWideCache)
 */
export const useTickets = (
  projectId: string,
  filters?: TicketFilters,
  sort?: TicketSort,
  search?: string,
  options?: {
    enabled?: boolean;
    limit?: number;
    useProjectWideCache?: boolean;
  }
) => {
  const limit = options?.limit;
  const useProjectWideCache = options?.useProjectWideCache ?? false;
  const queryFilters = useProjectWideCache
    ? omitParentIdFilter(filters)
    : filters;
  const parentIdFilter =
    useProjectWideCache && hasParentIdFilter(filters)
      ? filters.parentId
      : undefined;

  return useQuery({
    queryKey: queryKeys.projects.ticketsList(
      projectId,
      queryFilters,
      sort,
      search,
      limit
    ),
    queryFn: () =>
      listTickets(
        ticketRepository,
        projectId,
        queryFilters,
        sort,
        search,
        limit
      ),
    enabled: !!projectId && (options?.enabled ?? true),
    select:
      parentIdFilter === undefined
        ? undefined
        : (tickets) => applyParentIdFilter(tickets, parentIdFilter),
  });
};
