import { z } from "zod";

import { createNotFoundError } from "@/shared/errors/repositoryError";

import type {
  MoveAndReorderTicketInput,
  Ticket,
} from "@/modules/board/core/domain/ticket.types";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import {
  resolveCompletedAtForColumnChange,
  type WorkflowColumn,
} from "@/modules/board/core/usecases/ticket/ticketCompletion";

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
  input: MoveAndReorderTicketInput,
  columns: WorkflowColumn[]
): Promise<Ticket[]> => {
  const validatedInput = MoveAndReorderTicketInputSchema.parse(input);

  const ticket = await repository.findById(validatedInput.ticketId);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedInput.ticketId);
  }

  const completedAt = resolveCompletedAtForColumnChange({
    previousColumnId: ticket.columnId,
    previousCompletedAt: ticket.completedAt,
    nextColumnId: validatedInput.columnId,
    columns,
  });

  return repository.moveAndReorderTicket({
    ...validatedInput,
    completedAt,
  });
};
