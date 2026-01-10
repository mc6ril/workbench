import type { Ticket } from "@/core/domain/schema/ticket.schema";
import { ReorderTicketInputSchema } from "@/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Reorder tickets within a column or board.
 * Updates positions for multiple tickets in a single operation.
 * Used for drag-and-drop reordering of tickets.
 *
 * @param repository - Ticket repository
 * @param input - Reorder input with array of ticket positions
 * @returns Array of updated tickets
 * @throws NotFoundError if any ticket not found
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const reorderTicket = async (
  repository: TicketRepository,
  input: { ticketPositions: Array<{ id: string; position: number }> }
): Promise<Ticket[]> => {
  // Validate input with Zod schema
  const validatedInput = ReorderTicketInputSchema.parse(input);

  // Bulk update positions
  return repository.updatePositions(validatedInput.ticketPositions);
};
