import { z } from "zod";

import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

const AssignUsersToTicketInputSchema = z.object({
  ticketId: z.string().uuid("Ticket ID must be a valid UUID"),
  userIds: z
    .array(z.string().uuid("User ID must be a valid UUID"))
    .min(1, "At least one user ID is required"),
});

/**
 * Assign one or more users to a ticket.
 * Validates input and delegates to the repository.
 *
 * Business rules:
 * - Only project editors can assign (enforced by RLS)
 * - Users must be project members (enforced by FK + RLS)
 * - Duplicate assignments are silently ignored
 *
 * @param repository - Ticket repository
 * @param ticketId - Ticket to assign users to
 * @param userIds - User IDs to assign
 * @throws ZodError if input is invalid
 * @throws DatabaseError if database operation fails
 */
export const assignTicket = async (
  repository: TicketRepository,
  ticketId: string,
  userIds: string[]
): Promise<void> => {
  const validated = AssignUsersToTicketInputSchema.parse({
    ticketId,
    userIds,
  });
  return repository.assignUsers(validated.ticketId, validated.userIds);
};
