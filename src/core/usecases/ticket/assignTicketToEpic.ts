import { createDomainRuleError } from "@/core/domain/domainRuleError";
import { createNotFoundError } from "@/core/domain/repositoryError";
import { validateEpicTicketAssignment } from "@/core/domain/rules/epic.rules";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

import type { EpicRepository } from "@/core/ports/epicRepository";
import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Assign a ticket to an epic.
 * Validates that ticket and epic exist and belong to the same project.
 * Validates that ticket is not already assigned to another epic.
 *
 * @param ticketRepository - Ticket repository
 * @param epicRepository - Epic repository
 * @param ticketId - Ticket ID to assign
 * @param epicId - Epic ID to assign ticket to
 * @returns Updated ticket with epicId set
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
  // Fetch ticket
  const ticket = await ticketRepository.findById(ticketId);
  if (!ticket) {
    throw createNotFoundError("Ticket", ticketId);
  }

  // Fetch epic
  const epic = await epicRepository.findById(epicId);
  if (!epic) {
    throw createNotFoundError("Epic", epicId);
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
  return ticketRepository.assignToEpic(ticketId, epicId);
};
