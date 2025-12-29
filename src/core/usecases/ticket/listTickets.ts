import type {
  Ticket,
  TicketFilters,
} from "@/core/domain/ticket.schema";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * List all tickets for a project.
 *
 * @param repository - Ticket repository
 * @param projectId - Project ID
 * @param filters - Optional filters for ticket filtering
 * @returns Array of tickets
 * @throws DatabaseError if database operation fails
 */
export async function listTickets(
  repository: TicketRepository,
  projectId: string,
  filters?: TicketFilters
): Promise<Ticket[]> {
  return repository.listByProject(projectId, filters);
}
