import type {
  Ticket,
  TicketFilters,
  TicketSort,
} from "@/core/domain/schema/ticket.schema";
import { TicketSortSchema } from "@/core/domain/schema/ticket.schema";

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
export const listTickets = async (
  repository: TicketRepository,
  projectId: string,
  filters?: TicketFilters,
  sort?: TicketSort
): Promise<Ticket[]> => {
  const parsedSort = sort ? TicketSortSchema.parse(sort) : undefined;

  return repository.listByProject(projectId, filters, parsedSort);
};
