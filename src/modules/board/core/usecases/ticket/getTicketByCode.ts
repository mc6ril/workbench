import { z } from "zod";

import type {
  GetTicketByCodeInProjectInput,
  Ticket,
} from "@/modules/board/core/domain/ticket.types";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

const GetTicketByCodeInProjectInputSchema = z.object({
  projectId: z.string().uuid("Project id must be a valid UUID"),
  codeNumber: z
    .number()
    .int()
    .positive("Code number must be a positive integer"),
});

/**
 * Get a ticket by its code number within a specific project.
 *
 * The functional key of a ticket is (projectId, codeNumber). Project short
 * codes are never used here to resolve a project globally, which keeps the
 * lookup safe even when short codes are not unique.
 *
 * @param ticketRepository - Ticket repository
 * @param input - Project id and ticket code number
 * @returns Ticket or null if not found
 * @throws ZodError if input validation fails
 * @throws DatabaseError if database operation fails
 */
export const getTicketByCodeInProject = async (
  ticketRepository: TicketRepository,
  input: GetTicketByCodeInProjectInput
): Promise<Ticket | null> => {
  const validatedInput = GetTicketByCodeInProjectInputSchema.parse(input);

  return ticketRepository.findByCode(
    validatedInput.projectId,
    validatedInput.codeNumber
  );
};
