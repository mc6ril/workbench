import { createDomainRuleError } from "@/core/domain/domainRuleError";
import { createNotFoundError } from "@/core/domain/repositoryError";
import { validateTicket } from "@/core/domain/rules/ticket.rules";
import {
  type Ticket,
  type UpdateTicketInput,
  UpdateTicketInputSchema,
} from "@/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Update an existing ticket.
 * Validates input and domain rules, then updates the ticket.
 * Only validates parent relationships if parentId is being changed.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID
 * @param input - Ticket update data
 * @returns Updated ticket
 * @throws NotFoundError if ticket not found
 * @throws DomainRuleError if domain rules are violated (invalid parent relationship)
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const updateTicket = async (
  repository: TicketRepository,
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

  // Validate domain rules only if parentId is being updated
  if (validatedInput.parentId !== undefined) {
    // Determine the new parentId (could be null to remove parent)
    const newParentId =
      validatedInput.parentId ?? existingTicket.parentId ?? null;

    // Only validate if parentId is actually changing
    if (newParentId !== existingTicket.parentId) {
      // Fetch all tickets for multi-level nesting check
      const allTickets = await repository.listByProject(
        existingTicket.projectId
      );

      // Create ticket with new parentId for validation
      const ticketToValidate = {
        ...existingTicket,
        parentId: newParentId,
      };

      // Validate parent relationships
      const validationResult = validateTicket(ticketToValidate, allTickets);

      if (!validationResult.success) {
        throw createDomainRuleError(
          validationResult.error.code,
          validationResult.error.message,
          validationResult.error.field
        );
      }
    }
  }

  // Call repository to update ticket
  return repository.update(id, validatedInput);
};
