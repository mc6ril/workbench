import { z } from "zod";

import { createNotFoundError } from "@/shared/errors/repositoryError";

import type {
  MoveAndReorderTicketInput,
  Ticket,
} from "@/modules/board/core/domain/ticket.types";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import { resolveCompletedAtForProjectColumnChange } from "@/modules/board/core/usecases/ticket/ticketCompletion";

const MoveAndReorderTicketInputSchema = z.object({
  ticketId: z.string().uuid("Ticket ID must be a valid UUID"),
  columnId: z.string().uuid("Column ID must be a valid UUID"),
  position: z.number().int().nonnegative("Position must be non-negative"),
  ticketPositions: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int().nonnegative(),
    })
  ),
});

export const moveAndReorderTicket = async (
  repository: TicketRepository,
  boardRepository: BoardRepository,
  input: MoveAndReorderTicketInput
): Promise<Ticket[]> => {
  const validatedInput = MoveAndReorderTicketInputSchema.parse(input);

  const ticket = await repository.findById(validatedInput.ticketId);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedInput.ticketId);
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

  return repository.moveAndReorderTicket({
    ...validatedInput,
    completedAt,
  });
};
