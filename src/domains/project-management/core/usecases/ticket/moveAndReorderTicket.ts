import {
  MoveAndReorderTicketInputSchema,
  type Ticket,
} from "@/domains/project-management/core/domain/schema/ticket.schema";

import type { TicketRepository } from "@/domains/project-management/core/ports/ticketRepository";

export const moveAndReorderTicket = async (
  repository: TicketRepository,
  input: {
    ticketId: string;
    status: string;
    position: number;
    ticketPositions: Array<{ id: string; position: number }>;
  }
): Promise<Ticket[]> => {
  const validatedInput = MoveAndReorderTicketInputSchema.parse(input);

  return repository.moveAndReorderTicket(validatedInput);
};
