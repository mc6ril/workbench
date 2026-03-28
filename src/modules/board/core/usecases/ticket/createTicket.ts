import {
  type CreateTicketInput,
  CreateTicketInputSchema,
  type Ticket,
} from "@/modules/board/core/domain/schema/ticket.schema";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import { resolveCompletedAtForProjectColumnChange } from "@/modules/board/core/usecases/ticket/ticketCompletion";

/**
 * Create a new ticket.
 * Validates input and creates the ticket.
 *
 * @param repository - Ticket repository
 * @param input - Ticket creation data
 * @returns Created ticket
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const createTicket = async (
  repository: TicketRepository,
  boardRepository: BoardRepository,
  input: CreateTicketInput
): Promise<Ticket> => {
  // Validate input with Zod schema
  const validatedInput = CreateTicketInputSchema.parse(input);

  const codeNumber = await repository.getNextCodeNumberForProject(
    validatedInput.projectId
  );
  const completedAt = await resolveCompletedAtForProjectColumnChange(
    boardRepository,
    validatedInput.projectId,
    {
      previousColumnId: null,
      previousCompletedAt: null,
      nextColumnId: validatedInput.columnId,
    }
  );

  // Call repository to create ticket with allocated code number
  return repository.create({
    ...validatedInput,
    completedAt,
    codeNumber,
  });
};
