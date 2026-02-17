import { createNotFoundError } from "@/core/domain/repositoryError";
import {
  type Ticket,
  TicketIdInputSchema,
} from "@/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Get a ticket by ID.
 * Returns the complete ticket representation.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID (UUID)
 * @returns Ticket
 * @throws ZodError if id is not a valid UUID
 * @throws NotFoundError if ticket not found
 * @throws DatabaseError if database operation fails
 */
export const getTicketDetail = async (
  repository: TicketRepository,
  id: string
): Promise<Ticket> => {
  const { id: validatedId } = TicketIdInputSchema.parse({ id });

  const ticket = await repository.findById(validatedId);

  if (!ticket) {
    throw createNotFoundError("Ticket", validatedId);
  }

  return ticket;
};
