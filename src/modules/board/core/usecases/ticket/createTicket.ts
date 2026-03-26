import { createDomainRuleError } from "@/shared/errors/domainRuleError";

import { validateTicket } from "@/modules/board/core/domain/rules/ticket.rules";
import {
  type CreateTicketInput,
  CreateTicketInputSchema,
  type Ticket,
} from "@/modules/board/core/domain/schema/ticket.schema";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import { resolveCompletedAtForProjectStatusChange } from "@/modules/board/core/usecases/ticket/ticketCompletion";

/**
 * Create a new ticket.
 * Validates input and domain rules, then creates the ticket.
 * Enforces parent relationship rules (no circular refs, no multi-level nesting).
 *
 * @param repository - Ticket repository
 * @param input - Ticket creation data
 * @returns Created ticket
 * @throws DomainRuleError if domain rules are violated (invalid parent relationship)
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

  // Validate domain rules if parentId is provided
  if (validatedInput.parentId) {
    // Fetch all tickets for multi-level nesting check
    const allTickets = await repository.listByProject(validatedInput.projectId);

    // Validate parent relationships
    const validationResult = validateTicket(validatedInput, allTickets);

    if (!validationResult.success) {
      throw createDomainRuleError(
        validationResult.error.code,
        validationResult.error.message,
        validationResult.error.field
      );
    }
  }

  const codeNumber = await repository.getNextCodeNumberForProject(
    validatedInput.projectId
  );
  const completedAt = await resolveCompletedAtForProjectStatusChange(
    boardRepository,
    validatedInput.projectId,
    {
      previousStatus: null,
      previousCompletedAt: null,
      nextStatus: validatedInput.status,
    }
  );

  // Call repository to create ticket with allocated code number
  return repository.create({
    ...validatedInput,
    completedAt,
    codeNumber,
  });
};
