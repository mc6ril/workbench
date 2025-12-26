import { useQuery } from "@tanstack/react-query";

import { listTickets } from "@/core/usecases/ticket/listTickets";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching all tickets for a project.
 *
 * @param projectId - Project ID
 * @returns React Query hook result with tickets array, loading state, and error
 */
export const useTickets = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.byProject(projectId),
    queryFn: () => listTickets(ticketRepository, projectId),
    enabled: !!projectId, // Only fetch if projectId is provided
  });
};
