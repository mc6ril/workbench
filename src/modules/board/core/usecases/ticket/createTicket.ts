import { z } from "zod";

import {
  type CreateTicketInput,
  type Ticket,
  TICKET_PRIORITY_VALUES,
} from "@/modules/board/core/domain/ticket.types";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import { resolveCompletedAtForProjectColumnChange } from "@/modules/board/core/usecases/ticket/ticketCompletion";

const TicketPrioritySchema = z.enum(TICKET_PRIORITY_VALUES);

const CreateTicketInputSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, "Ticket title must not be empty"),
  description: z.string().nullable().optional(),
  columnId: z.string().uuid("Ticket column ID must be a valid UUID"),
  position: z.number().int().nonnegative().default(0),
  priority: TicketPrioritySchema.nullable().optional(),
  dueDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Due date must be a calendar date (YYYY-MM-DD)"
    )
    .nullable()
    .optional(),
  storyPoints: z.number().int().positive().nullable().optional(),
  createdBy: z.string().uuid().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  codeNumber: z.number().int().positive().optional(),
});

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

  return repository.create({
    ...validatedInput,
    completedAt,
    codeNumber,
  });
};
