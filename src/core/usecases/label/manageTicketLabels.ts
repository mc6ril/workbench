import type { LabelRepository } from "@/core/ports/labelRepository";

/**
 * Add labels to a ticket.
 */
export const addLabelsToTicket = async (
  ticketId: string,
  labelIds: string[],
  repo: LabelRepository
): Promise<void> => {
  if (labelIds.length === 0) {
    return;
  }
  return repo.addLabelsToTicket(ticketId, labelIds);
};

/**
 * Remove labels from a ticket.
 */
export const removeLabelsFromTicket = async (
  ticketId: string,
  labelIds: string[],
  repo: LabelRepository
): Promise<void> => {
  if (labelIds.length === 0) {
    return;
  }
  return repo.removeLabelsFromTicket(ticketId, labelIds);
};
