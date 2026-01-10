import { createNotFoundError } from "@/core/domain/repositoryError";

import type { EpicRepository } from "@/core/ports/epicRepository";
import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Delete an epic by ID.
 * Unassigns all tickets assigned to the epic before deletion.
 * Ensures tickets are explicitly unassigned via ticket-related ports before epic deletion.
 *
 * @param epicRepository - Epic repository
 * @param ticketRepository - Ticket repository
 * @param id - Epic ID
 * @throws NotFoundError if epic not found
 * @throws DatabaseError if database operation fails
 */
export const deleteEpic = async (
  epicRepository: EpicRepository,
  ticketRepository: TicketRepository,
  id: string
): Promise<void> => {
  // Fetch existing epic
  const epic = await epicRepository.findById(id);
  if (!epic) {
    throw createNotFoundError("Epic", id);
  }

  // Fetch all tickets assigned to epic
  const tickets = await epicRepository.listTicketsByEpic(id);

  // Unassign all tickets explicitly via ticket repository
  for (const ticket of tickets) {
    await ticketRepository.unassignFromEpic(ticket.id);
  }

  // Delete epic after all tickets are unassigned
  await epicRepository.delete(id);
};
