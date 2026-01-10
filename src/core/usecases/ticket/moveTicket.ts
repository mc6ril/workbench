import { z } from "zod";

import { createNotFoundError } from "@/core/domain/repositoryError";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Move a ticket to a new status/column and position.
 * Updates both status and position in a single atomic operation.
 * Used for drag-and-drop operations on the board.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID
 * @param status - New status/column
 * @param position - New position within the column
 * @returns Updated ticket
 * @throws NotFoundError if ticket not found
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const moveTicket = async (
  repository: TicketRepository,
  id: string,
  status: string,
  position: number
): Promise<Ticket> => {
  // Validate input
  const MoveTicketInputSchema = z.object({
    status: z.string().min(1, "Status must not be empty"),
    position: z.number().int().nonnegative("Position must be non-negative"),
  });

  MoveTicketInputSchema.parse({ status, position });

  // Check if ticket exists
  const ticket = await repository.findById(id);
  if (!ticket) {
    throw createNotFoundError("Ticket", id);
  }

  // Move ticket
  return repository.moveTicket(id, status, position);
};
