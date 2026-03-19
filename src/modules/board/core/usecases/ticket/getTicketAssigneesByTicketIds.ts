import type { TicketAssignee } from "@/modules/board/core/domain/schema/ticket.schema";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

/**
 * Fetch assignees for multiple tickets in a single repository call.
 *
 * @param repository - Ticket repository
 * @param ticketIds - Ticket IDs to resolve assignees for
 * @returns Record keyed by ticketId with assigned users
 */
export const getTicketAssigneesByTicketIds = async (
  repository: TicketRepository,
  ticketIds: string[]
): Promise<Record<string, TicketAssignee[]>> => {
  if (ticketIds.length === 0) {
    return {};
  }

  return repository.getAssigneesByTicketIds(ticketIds);
};
