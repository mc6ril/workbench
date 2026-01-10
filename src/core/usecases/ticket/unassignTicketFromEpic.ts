import { createNotFoundError } from "@/core/domain/repositoryError";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Unassign a ticket from its epic.
 * Sets the ticket's epicId field to null.
 *
 * @param repository - Ticket repository
 * @param ticketId - Ticket ID to unassign
 * @returns Updated ticket with epicId set to null
 * @throws NotFoundError if ticket not found
 * @throws DatabaseError if database operation fails
 */
export const unassignTicketFromEpic = async (
  repository: TicketRepository,
  ticketId: string
): Promise<Ticket> => {
  // Fetch ticket to verify it exists
  const ticket = await repository.findById(ticketId);
  if (!ticket) {
    throw createNotFoundError("Ticket", ticketId);
  }

  // Write via ticket repository
  return repository.unassignFromEpic(ticketId);
};
