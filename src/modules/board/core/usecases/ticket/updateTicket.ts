import { z } from "zod";

import { createNotFoundError } from "@/shared/errors/repositoryError";

import {
  type Ticket,
  TICKET_PRIORITY_VALUES,
  type UpdateTicketInput,
} from "@/modules/board/core/domain/ticket.types";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import {
  resolveCompletedAtForColumnChange,
  type WorkflowColumn,
} from "@/modules/board/core/usecases/ticket/ticketCompletion";

const TicketPrioritySchema = z.enum(TICKET_PRIORITY_VALUES);

const ChecklistItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  checked: z.boolean(),
  position: z.number().int().nonnegative(),
});

const UpdateTicketInputSchema = z.object({
  title: z.string().min(1, "Ticket title must not be empty").optional(),
  description: z.string().nullable().optional(),
  columnId: z.string().uuid("Ticket column ID must be a valid UUID").optional(),
  position: z.number().int().nonnegative().optional(),
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
  completedAt: z.coerce.date().nullable().optional(),
  archivedAt: z.coerce.date().nullable().optional(),
  archivedWeekStart: z.coerce.date().nullable().optional(),
  checklist: z.array(ChecklistItemSchema).optional(),
});

/**
 * Update an existing ticket.
 * Validates input and updates the ticket.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID
 * @param input - Ticket update data
 * @param columns - The project's board columns, used to resolve `completedAt`
 *   without an extra round trip when `columnId` changes (caller already has
 *   these cached).
 * @returns Updated ticket
 * @throws NotFoundError if ticket not found
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const updateTicket = async (
  repository: TicketRepository,
  id: string,
  input: UpdateTicketInput,
  columns: WorkflowColumn[]
): Promise<Ticket> => {
  const validatedInput = UpdateTicketInputSchema.parse(input);

  const existingTicket = await repository.findById(id);
  if (!existingTicket) {
    throw createNotFoundError("Ticket", id);
  }

  const completedAt =
    validatedInput.columnId === undefined
      ? validatedInput.completedAt
      : resolveCompletedAtForColumnChange({
          previousColumnId: existingTicket.columnId,
          previousCompletedAt: existingTicket.completedAt,
          nextColumnId: validatedInput.columnId,
          columns,
        });

  return repository.update(id, {
    ...validatedInput,
    completedAt,
  });
};
