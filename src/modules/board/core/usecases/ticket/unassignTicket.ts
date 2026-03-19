import { UnassignUsersFromTicketInputSchema } from "@/modules/board/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

/**
 * Unassign one or more users from a ticket.
 * Validates input and delegates to the repository.
 *
 * @param repository - Ticket repository
 * @param ticketId - Ticket to unassign users from
 * @param userIds - User IDs to unassign
 * @throws ZodError if input is invalid
 * @throws DatabaseError if database operation fails
 */
export const unassignTicket = async (
  repository: TicketRepository,
  ticketId: string,
  userIds: string[]
): Promise<void> => {
  UnassignUsersFromTicketInputSchema.parse({ ticketId, userIds });
  return repository.unassignUsers(ticketId, userIds);
};
