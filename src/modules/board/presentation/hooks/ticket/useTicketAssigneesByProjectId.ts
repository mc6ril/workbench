import { useQuery } from "@tanstack/react-query";

import type { TicketAssignee } from "@/modules/board/core/domain/schema/ticket.schema";

import { getTicketAssigneesByProjectId } from "@/modules/board/core/usecases/ticket/getTicketAssigneesByProjectId";

import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

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
