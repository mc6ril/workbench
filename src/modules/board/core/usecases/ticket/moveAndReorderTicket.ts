import {
  MoveAndReorderTicketInputSchema,
  type Ticket,
} from "@/modules/board/core/domain/schema/ticket.schema";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import { createNotFoundError } from "@/shared/errors/repositoryError";
import { resolveCompletedAtForProjectStatusChange } from "@/modules/board/core/usecases/ticket/ticketCompletion";

export const moveAndReorderTicket = async (
  repository: TicketRepository,
  boardRepository: BoardRepository,
  input: {
    ticketId: string;
    status: string;
    position: number;
    ticketPositions: Array<{ id: string; position: number }>;
  }
): Promise<Ticket[]> => {
  const validatedInput = MoveAndReorderTicketInputSchema.parse(input);

  const ticket = await repository.findById(validatedInput.ticketId);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedInput.ticketId);
  }

  const completedAt = await resolveCompletedAtForProjectStatusChange(
    boardRepository,
    ticket.projectId,
    {
      previousStatus: ticket.status,
      previousCompletedAt: ticket.completedAt,
      nextStatus: validatedInput.status,
    }
  );

  return repository.moveAndReorderTicket({
    ...validatedInput,
    completedAt,
  });
};
