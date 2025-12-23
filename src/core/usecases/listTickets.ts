import type { Ticket } from "@/core/domain/ticket/ticket.schema";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * List all tickets for a project.
 *
 * @param repository - Ticket repository
 * @param projectId - Project ID
 * @returns Array of tickets
 * @throws DatabaseError if database operation fails
 */
export async function listTickets(
  repository: TicketRepository,
  projectId: string
): Promise<Ticket[]> {
  return repository.listByProject(projectId);
}
