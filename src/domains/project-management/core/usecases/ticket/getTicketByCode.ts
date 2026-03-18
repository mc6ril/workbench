import {
  type GetTicketByCodeInput,
  GetTicketByCodeInputSchema,
  type Ticket,
} from "@/domains/project-management/core/domain/schema/ticket.schema";

import type { ProjectRepository } from "@/domains/project-management/core/ports/projectRepository";
import type { TicketRepository } from "@/domains/project-management/core/ports/ticketRepository";

/**
 * Get a ticket by its project short code and code number.
 * Validates input, resolves the project, then fetches the ticket.
 *
 * @param projectRepository - Project repository
 * @param ticketRepository - Ticket repository
 * @param input - Project short code and ticket code number
 * @returns Ticket or null if not found
 * @throws ZodError if input validation fails
 * @throws DatabaseError if database operation fails
 */
export const getTicketByCode = async (
  projectRepository: ProjectRepository,
  ticketRepository: TicketRepository,
  input: GetTicketByCodeInput
): Promise<Ticket | null> => {
  const validatedInput = GetTicketByCodeInputSchema.parse(input);

  const shortCode = validatedInput.projectShortCode.trim().toUpperCase();

  const project = await projectRepository.findByShortCode(shortCode);

  if (!project) {
    return null;
  }

  return ticketRepository.findByCode(project.id, validatedInput.codeNumber);
};
