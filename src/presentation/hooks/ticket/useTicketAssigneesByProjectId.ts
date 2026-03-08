import { useQuery } from "@tanstack/react-query";

import type { TicketAssignee } from "@/core/domain/schema/ticket.schema";

import { getTicketAssigneesByProjectId } from "@/core/usecases/ticket/getTicketAssigneesByProjectId";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching assignees for all tickets in a project.
 *
 * @param projectId - Project ID
 * @returns Record keyed by ticketId
 */
export const useTicketAssigneesByProjectId = (projectId: string) => {
  return useQuery<Record<string, TicketAssignee[]>>({
    queryKey: queryKeys.tickets.assigneesByProjectId(projectId),
    queryFn: () => getTicketAssigneesByProjectId(ticketRepository, projectId),
    enabled: !!projectId,
  });
};
