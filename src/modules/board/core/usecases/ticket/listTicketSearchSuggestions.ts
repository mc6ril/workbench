import type { TicketSearchItem } from "@/modules/board/core/domain/ticket.types";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

/**
 * List lightweight ticket search matches for board typeahead suggestions.
 *
 * @param repository - Ticket repository
 * @param projectId - Project ID
 * @param search - Search term
 * @param limit - Optional maximum number of matches
 * @returns Lightweight ticket search matches
 */
export const listTicketSearchSuggestions = async (
  repository: TicketRepository,
  projectId: string,
  search: string,
  limit?: number
): Promise<TicketSearchItem[]> => {
  return repository.listSearchSuggestions(projectId, search, limit);
};
