import { AssignUsersToTicketInputSchema } from "@/modules/board/core/domain/schema/ticket.schema";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

/**
 * Assign one or more users to a ticket.
 * Validates input and delegates to the repository.
 *
 * Business rules:
 * - Only project editors can assign (enforced by RLS)
 * - Users must be project members (enforced by FK + RLS)
 * - Duplicate assignments are silently ignored
 *
 * @param repository - Ticket repository
 * @param ticketId - Ticket to assign users to
 * @param userIds - User IDs to assign
 * @throws ZodError if input is invalid
 * @throws DatabaseError if database operation fails
 */
export const assignTicket = async (
  repository: TicketRepository,
  ticketId: string,
  userIds: string[]
): Promise<void> => {
  AssignUsersToTicketInputSchema.parse({ ticketId, userIds });
  return repository.assignUsers(ticketId, userIds);
};
