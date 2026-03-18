import { createDomainRuleError } from "@/domains/project-management/core/domain/domainRuleError";
import { createNotFoundError } from "@/domains/project-management/core/domain/repositoryError";
import { TicketIdInputSchema } from "@/domains/project-management/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/domains/project-management/core/ports/ticketRepository";

/**
 * Delete a ticket by ID.
 * Validates that the ticket has no subtasks before deletion.
 * Enforces manual deletion of subtasks first.
 *
 * @param repository - Ticket repository
 * @param id - Ticket ID (UUID)
 * @throws ZodError if id is not a valid UUID
 * @throws NotFoundError if ticket not found
 * @throws DomainRuleError if ticket has subtasks (TICKET_HAS_SUBTASKS)
 * @throws DatabaseError if database operation fails
 */
export const deleteTicket = async (
  repository: TicketRepository,
  id: string
): Promise<void> => {
  const { id: validatedId } = TicketIdInputSchema.parse({ id });

  // Fetch existing ticket
  const ticket = await repository.findById(validatedId);
  if (!ticket) {
    throw createNotFoundError("Ticket", validatedId);
  }

  // Check if ticket has subtasks
  const subtasks = await repository.listByProject(ticket.projectId, {
    parentId: validatedId,
  });

  if (subtasks.length > 0) {
    throw createDomainRuleError(
      "TICKET_HAS_SUBTASKS",
      `Ticket ${validatedId} cannot be deleted because it has ${subtasks.length} subtask(s). Delete subtasks first.`,
      "id"
    );
  }

  // Call repository to delete ticket
  await repository.delete(validatedId);
};
