import { z } from "zod";

import type { GetTicketByCodeInProjectInput, Ticket } from "@/modules/board/core/domain/ticket.types";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

const GetTicketByCodeInProjectIncludingArchivedInputSchema = z.object({
  projectId: z.string().uuid("Project id must be a valid UUID"),
  codeNumber: z
    .number()
    .int()
    .positive("Code number must be a positive integer"),
});

/**
 * Get a ticket by its code number within a specific project, including
 * archived tickets.
 *
 * This usecase mirrors {@link getTicketByCodeInProject} but delegates to a
 * repository method that does not filter archived records. The functional key
 * remains (projectId, codeNumber); short codes are not used to resolve
 * projects.
 *
 * @param ticketRepository - Ticket repository
 * @param input - Project id and ticket code number
 * @returns Ticket or null if not found
 * @throws ZodError if input validation fails
 * @throws DatabaseError if database operation fails
 */
export const getTicketByCodeInProjectIncludingArchived = async (
  ticketRepository: TicketRepository,
  input: GetTicketByCodeInProjectInput
): Promise<Ticket | null> => {
  const validatedInput =
    GetTicketByCodeInProjectIncludingArchivedInputSchema.parse(input);

  return ticketRepository.findByCodeIncludingArchived(
    validatedInput.projectId,
    validatedInput.codeNumber
  );
};

