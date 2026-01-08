import { useQuery } from "@tanstack/react-query";

import type { TicketFilters } from "@/core/domain/schema/ticket.schema";

import { listTickets } from "@/core/usecases/ticket/listTickets";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching all tickets for a project.
 * Follows the standardized `useProject*` naming convention for project-scoped data.
 *
 * @param projectId - Project ID
 * @param filters - Optional filters for ticket filtering (status, epicId)
 * @returns React Query hook result with tickets array, loading state, and error
 */
export const useProjectTickets = (
  projectId: string,
  filters?: TicketFilters
) => {
  return useQuery({
    queryKey: queryKeys.projects.tickets(projectId, filters),
    queryFn: () => listTickets(ticketRepository, projectId, filters),
    enabled: !!projectId, // Only fetch if projectId is provided
  });
};
