import { useQuery } from "@tanstack/react-query";

import type { TicketAssignee } from "@/modules/board/core/domain/ticket.types";
import { getTicketAssigneesByProjectId } from "@/modules/board/core/usecases/ticket/getTicketAssigneesByProjectId";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for fetching assignees for all tickets in a project.
 *
 * @param projectId - Project ID (query disabled when undefined)
 * @returns Record keyed by ticketId
 */
export const useTicketAssigneesByProjectId = (
  projectId: string | undefined
) => {
  return useQuery<Record<string, TicketAssignee[]>>({
    queryKey: queryKeys.tickets.assigneesByProjectId(projectId ?? ""),
    queryFn: () => getTicketAssigneesByProjectId(ticketRepository, projectId!),
    enabled: !!projectId,
  });
};
