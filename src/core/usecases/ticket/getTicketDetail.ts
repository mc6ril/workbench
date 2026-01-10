import { createNotFoundError } from "@/core/domain/repositoryError";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Get a ticket by ID.
 * Returns the complete ticket representation.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID
 * @returns Ticket
 * @throws NotFoundError if ticket not found
 * @throws DatabaseError if database operation fails
 */
export const getTicketDetail = async (
  repository: TicketRepository,
  id: string
): Promise<Ticket> => {
  const ticket = await repository.findById(id);

  if (!ticket) {
    throw createNotFoundError("Ticket", id);
  }

  return ticket;
};
