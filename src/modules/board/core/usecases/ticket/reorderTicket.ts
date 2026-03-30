import { z } from "zod";

import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

const ReorderTicketInputSchema = z.object({
  ticketPositions: z
    .array(
      z.object({
        id: z.string().uuid(),
        position: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one ticket position is required"),
});

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
  const validatedInput = ReorderTicketInputSchema.parse(input);

  return repository.updatePositions(validatedInput.ticketPositions);
};
