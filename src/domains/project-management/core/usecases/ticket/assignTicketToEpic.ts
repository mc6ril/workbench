import { createDomainRuleError } from "@/shared/errors/domainRuleError";
import { createNotFoundError } from "@/shared/errors/repositoryError";
import { validateEpicTicketAssignment } from "@/domains/project-management/core/domain/rules/epic.rules";
import {
  AssignTicketToEpicInputSchema,
  type Ticket,
} from "@/domains/project-management/core/domain/schema/ticket.schema";

import type { EpicRepository } from "@/domains/project-management/core/ports/epicRepository";
import type { TicketRepository } from "@/domains/project-management/core/ports/ticketRepository";

/**
 * Assign a ticket to an epic.
 * Validates that ticket and epic exist and belong to the same project.
 * Validates that ticket is not already assigned to another epic.
 *
 * @param ticketRepository - Ticket repository
 * @param epicRepository - Epic repository
 * @param ticketId - Ticket ID to assign (UUID)
 * @param epicId - Epic ID to assign ticket to (UUID)
 * @returns Updated ticket with epicId set
 * @throws ZodError if ticketId or epicId is not a valid UUID
 * @throws NotFoundError if ticket or epic not found
 * @throws DomainRuleError if domain rules are violated (project mismatch, duplicate assignment)
 * @throws ConstraintError if constraint violation occurs
 * @throws DatabaseError if database operation fails
 */
export const assignTicketToEpic = async (
  ticketRepository: TicketRepository,
  epicRepository: EpicRepository,
  ticketId: string,
  epicId: string
): Promise<Ticket> => {
  const validatedInput = AssignTicketToEpicInputSchema.parse({
    ticketId,
    epicId,
  });

  // Fetch ticket
  const ticket = await ticketRepository.findById(validatedInput.ticketId);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedInput.ticketId);
  }

  // Fetch epic
  const epic = await epicRepository.findById(validatedInput.epicId);
  if (!epic) {
    throw createNotFoundError("Epic", validatedInput.epicId);
  }

  // Validate assignment using domain rules
  const validationResult = validateEpicTicketAssignment(ticket, epic);

  if (!validationResult.success) {
    throw createDomainRuleError(
      validationResult.error.code,
      validationResult.error.message,
      validationResult.error.field
    );
  }

  // Write via ticket repository
  return ticketRepository.assignToEpic(
    validatedInput.ticketId,
    validatedInput.epicId
  );
};
