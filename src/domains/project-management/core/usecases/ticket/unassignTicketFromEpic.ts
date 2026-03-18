import { createNotFoundError } from "@/domains/project-management/core/domain/repositoryError";
import {
  type Ticket,
  UnassignTicketFromEpicInputSchema,
} from "@/domains/project-management/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/domains/project-management/core/ports/ticketRepository";

/**
 * Unassign a ticket from its epic.
 * Sets the ticket's epicId field to null.
 *
 * @param repository - Ticket repository
 * @param ticketId - Ticket ID to unassign (UUID)
 * @returns Updated ticket with epicId set to null
 * @throws ZodError if ticketId is not a valid UUID
 * @throws NotFoundError if ticket not found
 * @throws DatabaseError if database operation fails
 */
export const unassignTicketFromEpic = async (
  repository: TicketRepository,
  ticketId: string
): Promise<Ticket> => {
  const { ticketId: validatedTicketId } =
    UnassignTicketFromEpicInputSchema.parse({ ticketId });

  // Fetch ticket to verify it exists
  const ticket = await repository.findById(validatedTicketId);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedTicketId);
  }

  // Write via ticket repository
  return repository.unassignFromEpic(validatedTicketId);
};
