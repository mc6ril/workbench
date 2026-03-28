import { createNotFoundError } from "@/shared/errors/repositoryError";

import {
  type Ticket,
  type UpdateTicketInput,
  UpdateTicketInputSchema,
} from "@/modules/board/core/domain/schema/ticket.schema";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import { resolveCompletedAtForProjectColumnChange } from "@/modules/board/core/usecases/ticket/ticketCompletion";

/**
 * Update an existing ticket.
 * Validates input and updates the ticket.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID
 * @param input - Ticket update data
 * @returns Updated ticket
 * @throws NotFoundError if ticket not found
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const updateTicket = async (
  repository: TicketRepository,
  boardRepository: BoardRepository,
  id: string,
  input: UpdateTicketInput
): Promise<Ticket> => {
  // Validate input with Zod schema
  const validatedInput = UpdateTicketInputSchema.parse(input);

  // Fetch existing ticket
  const existingTicket = await repository.findById(id);
  if (!existingTicket) {
    throw createNotFoundError("Ticket", id);
  }

  const completedAt =
    validatedInput.columnId === undefined
      ? validatedInput.completedAt
      : await resolveCompletedAtForProjectColumnChange(
          boardRepository,
          existingTicket.projectId,
          {
            previousColumnId: existingTicket.columnId,
            previousCompletedAt: existingTicket.completedAt,
            nextColumnId: validatedInput.columnId,
          }
        );

  // Call repository to update ticket
  return repository.update(id, {
    ...validatedInput,
    completedAt,
  });
};
