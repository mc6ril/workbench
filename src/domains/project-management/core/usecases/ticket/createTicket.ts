import { createDomainRuleError } from "@/shared/errors/domainRuleError";
import { validateTicket } from "@/domains/project-management/core/domain/rules/ticket.rules";
import {
  type CreateTicketInput,
  CreateTicketInputSchema,
  type Ticket,
} from "@/domains/project-management/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/domains/project-management/core/ports/ticketRepository";

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

  // Call repository to create ticket with allocated code number
  return repository.create({
    ...validatedInput,
    codeNumber,
  });
};
