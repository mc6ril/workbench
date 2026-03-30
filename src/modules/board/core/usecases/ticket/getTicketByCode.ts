import { z } from "zod";

import type { GetTicketByCodeInput, Ticket } from "@/modules/board/core/domain/ticket.types";
import type { ProjectLookupRepository } from "@/modules/board/core/ports/projectLookupRepository";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";

const GetTicketByCodeInputSchema = z.object({
  projectShortCode: z.string().min(1, "Project short code must not be empty"),
  codeNumber: z
    .number()
    .int()
    .positive("Code number must be a positive integer"),
});

/**
 * Get a ticket by its project short code and code number.
 * Validates input, resolves the project, then fetches the ticket.
 *
 * @param projectLookupRepository - Minimal project lookup (short code → id)
 * @param ticketRepository - Ticket repository
 * @param input - Project short code and ticket code number
 * @returns Ticket or null if not found
 * @throws ZodError if input validation fails
 * @throws DatabaseError if database operation fails
 */
export const getTicketByCode = async (
  projectLookupRepository: ProjectLookupRepository,
  ticketRepository: TicketRepository,
  input: GetTicketByCodeInput
): Promise<Ticket | null> => {
  const validatedInput = GetTicketByCodeInputSchema.parse(input);

  const shortCode = validatedInput.projectShortCode.trim().toUpperCase();

  const projectId = await projectLookupRepository.findIdByShortCode(shortCode);

  if (!projectId) {
    return null;
  }

  return ticketRepository.findByCode(projectId, validatedInput.codeNumber);
};
