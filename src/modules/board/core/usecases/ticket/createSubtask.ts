import { createDomainRuleError } from "@/shared/errors/domainRuleError";
import { createNotFoundError } from "@/shared/errors/repositoryError";

import { validateTicket } from "@/modules/board/core/domain/rules/ticket.rules";
import {
  type CreateSubtaskInput,
  CreateSubtaskInputSchema,
  type Ticket,
} from "@/modules/board/core/domain/schema/ticket.schema";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

/**
 * Create a subtask for a ticket.
 * Validates that parent ticket exists and is not a subtask itself.
 * Enforces single-level nesting (no subtask of subtask).
 * Ensures subtask belongs to the same project as parent.
 *
 * @param repository - Ticket repository
 * @param input - Subtask creation data (parentId is required)
 * @returns Created subtask
 * @throws NotFoundError if parent ticket not found
 * @throws DomainRuleError if domain rules are violated (parent is subtask, project mismatch, invalid parent relationship)
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const createSubtask = async (
  repository: TicketRepository,
  input: CreateSubtaskInput
): Promise<Ticket> => {
  // Validate input with Zod schema (parentId is required)
  const validatedInput = CreateSubtaskInputSchema.parse(input);

  // Fetch parent ticket
  const parentTicket = await repository.findById(validatedInput.parentId);
  if (!parentTicket) {
    throw createNotFoundError("Ticket", validatedInput.parentId);
  }

  // Validate parent is not a subtask itself (no multi-level nesting)
  if (parentTicket.parentId !== null) {
    throw createDomainRuleError(
      "INVALID_TICKET_PARENT_MULTI_LEVEL",
      `Parent ticket ${validatedInput.parentId} is already a subtask. Multi-level nesting is not allowed.`,
      "parentId"
    );
  }

  // Validate project consistency
  if (validatedInput.projectId !== parentTicket.projectId) {
    throw createDomainRuleError(
      "TICKET_PROJECT_MISMATCH",
      `Subtask project ${validatedInput.projectId} does not match parent ticket project ${parentTicket.projectId}`,
      "projectId"
    );
  }

  // Fetch all tickets for multi-level nesting check
  const allTickets = await repository.listByProject(validatedInput.projectId);

  // Validate parent relationships using domain rules
  const validationResult = validateTicket(validatedInput, allTickets);

  if (!validationResult.success) {
    throw createDomainRuleError(
      validationResult.error.code,
      validationResult.error.message,
      validationResult.error.field
    );
  }

  const codeNumber = await repository.getNextCodeNumberForProject(
    validatedInput.projectId
  );

  // Call repository to create subtask with allocated code number
  return repository.create({
    ...validatedInput,
    codeNumber,
  });
};
