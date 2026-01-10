import { createDomainRuleError } from "@/core/domain/domainRuleError";
import { createNotFoundError } from "@/core/domain/repositoryError";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Delete a ticket by ID.
 * Validates that the ticket has no subtasks before deletion.
 * Enforces manual deletion of subtasks first.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID
 * @throws NotFoundError if ticket not found
 * @throws DomainRuleError if ticket has subtasks (TICKET_HAS_SUBTASKS)
 * @throws DatabaseError if database operation fails
 */
export const deleteTicket = async (
  repository: TicketRepository,
  id: string
): Promise<void> => {
  // Fetch existing ticket
  const ticket = await repository.findById(id);
  if (!ticket) {
    throw createNotFoundError("Ticket", id);
  }

  // Check if ticket has subtasks
  const subtasks = await repository.listByProject(ticket.projectId, {
    parentId: id,
  });

  if (subtasks.length > 0) {
    throw createDomainRuleError(
      "TICKET_HAS_SUBTASKS",
      `Ticket ${id} cannot be deleted because it has ${subtasks.length} subtask(s). Delete subtasks first.`,
      "id"
    );
  }

  // Call repository to delete ticket
  await repository.delete(id);
};
