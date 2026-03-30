import { z } from "zod";

import { createNotFoundError } from "@/shared/errors/repositoryError";

import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

const TicketIdInputSchema = z.object({
  id: z.string().uuid("Ticket ID must be a valid UUID"),
});

/**
 * Delete a ticket by ID.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID (UUID)
 * @throws ZodError if id is not a valid UUID
 * @throws NotFoundError if ticket not found
 * @throws DatabaseError if database operation fails
 */
export const deleteTicket = async (
  repository: TicketRepository,
  id: string
): Promise<void> => {
  const { id: validatedId } = TicketIdInputSchema.parse({ id });

  const ticket = await repository.findById(validatedId);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedId);
  }

  await repository.delete(validatedId);
};
