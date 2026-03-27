import { createNotFoundError } from "@/shared/errors/repositoryError";

import { TicketIdInputSchema } from "@/modules/board/core/domain/schema/ticket.schema";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

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

  // Fetch existing ticket
  const ticket = await repository.findById(validatedId);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedId);
  }

  // Call repository to delete ticket
  await repository.delete(validatedId);
};
