import type { TicketAssignee } from "@/modules/board/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

/**
 * Fetch assignees for all tickets in a project in a single repository call.
 *
 * @param repository - Ticket repository
 * @param projectId - Project ID
 * @returns Record keyed by ticketId with assigned users
 */
export const getTicketAssigneesByProjectId = async (
  repository: TicketRepository,
  projectId: string
): Promise<Record<string, TicketAssignee[]>> => {
  if (!projectId) {
    return {};
  }

  return repository.getAssigneesByProjectId(projectId);
};
