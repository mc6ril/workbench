import type { Ticket, TicketFilters } from "@/modules/board/core/domain/ticket.types";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

/**
 * List all tickets for a project.
 *
 * @param repository - Ticket repository
 * @param projectId - Project ID
 * @param filters - Optional filters for ticket filtering
 * @param search - Optional server-side search term
 * @param limit - Optional max number of rows
 * @returns Array of tickets
 * @throws DatabaseError if database operation fails
 */
export const listTickets = async (
  repository: TicketRepository,
  projectId: string,
  filters?: TicketFilters,
  search?: string,
  limit?: number
): Promise<Ticket[]> => {
  return repository.listByProject(projectId, filters, search, limit);
};
