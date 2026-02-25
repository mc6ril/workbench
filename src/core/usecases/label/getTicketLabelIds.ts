import type { LabelRepository } from "@/core/ports/labelRepository";

/**
 * Get label IDs attached to a ticket.
 */
export const getTicketLabelIds = async (
  ticketId: string,
  repo: LabelRepository
): Promise<string[]> => {
  return repo.getTicketLabelIds(ticketId);
};
