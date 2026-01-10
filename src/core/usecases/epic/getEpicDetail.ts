import { createNotFoundError } from "@/core/domain/repositoryError";
import { calculateEpicProgress } from "@/core/domain/rules/epic.rules";
import type { EpicDetail } from "@/core/domain/schema/epic.schema";

import type { EpicRepository } from "@/core/ports/epicRepository";

/**
 * Get epic detail by ID with progress and assigned tickets.
 * Returns complete epic representation including description, progress, and linked tickets.
 * Tickets include minimal info (id, title, status) as required.
 *
 * @param repository - Epic repository
 * @param id - Epic ID
 * @returns Epic detail with progress and tickets
 * @throws NotFoundError if epic not found
 * @throws DatabaseError if database operation fails
 */
export const getEpicDetail = async (
  repository: EpicRepository,
  id: string
): Promise<EpicDetail> => {
  // Fetch epic
  const epic = await repository.findById(id);
  if (!epic) {
    throw createNotFoundError("Epic", id);
  }

  // Fetch tickets assigned to epic
  const tickets = await repository.listTicketsByEpic(id);

  // Calculate progress
  const progress = calculateEpicProgress(tickets);

  // Map tickets to minimal ticket info (id, title, status only)
  const ticketInfo = tickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
  }));

  // Return epic detail with progress and tickets
  return {
    ...epic,
    progress,
    tickets: ticketInfo,
  };
};
