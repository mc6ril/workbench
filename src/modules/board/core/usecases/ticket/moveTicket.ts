import { z } from "zod";

import { createNotFoundError } from "@/shared/errors/repositoryError";

import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import {
  resolveCompletedAtForColumnChange,
  type WorkflowColumn,
} from "@/modules/board/core/usecases/ticket/ticketCompletion";

const MoveTicketInputSchema = z.object({
  id: z.string().uuid("Ticket ID must be a valid UUID"),
  columnId: z.string().uuid("Column ID must be a valid UUID"),
  position: z.number().int().nonnegative("Position must be non-negative"),
});

/**
 * Move a ticket to a new column and position.
 * Updates both column assignment and position in a single atomic operation.
 * Used for drag-and-drop operations on the board.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID (UUID)
 * @param columnId - New target column
 * @param position - New position within the column
 * @param columns - The project's board columns, used to resolve `completedAt`
 *   without an extra round trip (caller already has these cached).
 * @returns Updated ticket
 * @throws ZodError if input validation fails
 * @throws NotFoundError if ticket not found
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const moveTicket = async (
  repository: TicketRepository,
  id: string,
  columnId: string,
  position: number,
  columns: WorkflowColumn[]
): Promise<Ticket> => {
  const validatedInput = MoveTicketInputSchema.parse({
    id,
    columnId,
    position,
  });

  const ticket = await repository.findById(validatedInput.id);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedInput.id);
  }

  const completedAt = resolveCompletedAtForColumnChange({
    previousColumnId: ticket.columnId,
    previousCompletedAt: ticket.completedAt,
    nextColumnId: validatedInput.columnId,
    columns,
  });

  return repository.moveTicket(
    validatedInput.id,
    validatedInput.columnId,
    validatedInput.position,
    completedAt
  );
};
