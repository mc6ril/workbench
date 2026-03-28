import { createNotFoundError } from "@/shared/errors/repositoryError";

import {
  MoveTicketInputSchema,
  type Ticket,
} from "@/modules/board/core/domain/schema/ticket.schema";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import { resolveCompletedAtForProjectColumnChange } from "@/modules/board/core/usecases/ticket/ticketCompletion";

/**
 * Move a ticket to a new column and position.
 * Updates both column assignment and position in a single atomic operation.
 * Used for drag-and-drop operations on the board.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID (UUID)
 * @param columnId - New target column
 * @param position - New position within the column
 * @returns Updated ticket
 * @throws ZodError if input validation fails
 * @throws NotFoundError if ticket not found
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const moveTicket = async (
  repository: TicketRepository,
  boardRepository: BoardRepository,
  id: string,
  columnId: string,
  position: number
): Promise<Ticket> => {
  const validatedInput = MoveTicketInputSchema.parse({ id, columnId, position });

  // Check if ticket exists
  const ticket = await repository.findById(validatedInput.id);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedInput.id);
  }

  const completedAt = await resolveCompletedAtForProjectColumnChange(
    boardRepository,
    ticket.projectId,
    {
      previousColumnId: ticket.columnId,
      previousCompletedAt: ticket.completedAt,
      nextColumnId: validatedInput.columnId,
    }
  );

  return repository.moveTicket(
    validatedInput.id,
    validatedInput.columnId,
    validatedInput.position,
    completedAt
  );
};
