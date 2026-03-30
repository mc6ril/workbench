import { z } from "zod";

import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

const UnassignUsersFromTicketInputSchema = z.object({
  ticketId: z.string().uuid("Ticket ID must be a valid UUID"),
  userIds: z
    .array(z.string().uuid("User ID must be a valid UUID"))
    .min(1, "At least one user ID is required"),
});

/**
 * Unassign one or more users from a ticket.
 * Validates input and delegates to the repository.
 *
 * @param repository - Ticket repository
 * @param ticketId - Ticket to unassign users from
 * @param userIds - User IDs to unassign
 * @throws ZodError if input is invalid
 * @throws DatabaseError if database operation fails
 */
export const unassignTicket = async (
  repository: TicketRepository,
  ticketId: string,
  userIds: string[]
): Promise<void> => {
  const validated = UnassignUsersFromTicketInputSchema.parse({
    ticketId,
    userIds,
  });
  return repository.unassignUsers(validated.ticketId, validated.userIds);
};
