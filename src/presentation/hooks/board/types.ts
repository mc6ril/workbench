import type { BoardTicketViewModel } from "@/shared/types/board";

export type BoardTicketIds = Record<string, string[]>;

export type TicketLocation = {
  columnId: string;
  index: number;
};

export type TicketLocationIndex = Record<string, TicketLocation>;

export type BoardColumnTickets = Map<string, BoardTicketViewModel[]>;
