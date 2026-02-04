import type { Ticket } from "@/core/domain/schema/ticket.schema";

import type { ProjectRepository } from "@/core/ports/projectRepository";
import type { TicketRepository } from "@/core/ports/ticketRepository";

type GetTicketByCodeInput = {
  projectShortCode: string;
  codeNumber: number;
};

export const getTicketByCode = async (
  projectRepository: ProjectRepository,
  ticketRepository: TicketRepository,
  input: GetTicketByCodeInput
): Promise<Ticket | null> => {
  const shortCode = input.projectShortCode.trim().toUpperCase();

  const project = await projectRepository.findByShortCode(shortCode);

  if (!project) {
    return null;
  }

  return ticketRepository.findByCode(project.id, input.codeNumber);
};
