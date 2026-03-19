import type {
  Ticket,
  TicketFilters,
  TicketSort,
} from "@/modules/board/core/domain/schema/ticket.schema";
import { TicketSortSchema } from "@/modules/board/core/domain/schema/ticket.schema";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

/**
 * List all tickets for a project.
 *
 * @param repository - Ticket repository
 * @param projectId - Project ID
 * @param filters - Optional filters for ticket filtering
 * @param sort - Optional sorting
 * @param search - Optional server-side search term
 * @param limit - Optional max number of rows
 * @returns Array of tickets
 * @throws DatabaseError if database operation fails
 */
export const listTickets = async (
  repository: TicketRepository,
  projectId: string,
  filters?: TicketFilters,
  sort?: TicketSort,
  search?: string,
  limit?: number
): Promise<Ticket[]> => {
  const parsedSort = sort ? TicketSortSchema.parse(sort) : undefined;

  return repository.listByProject(
    projectId,
    filters,
    parsedSort,
    search,
    limit
  );
};
