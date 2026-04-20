import type { BoardTicketIds } from "@/modules/board/core/usecases/board/boardDnD";
import type { BoardColumnTickets } from "@/modules/board/presentation/hooks/board/types";
import type {
  BoardColumnConfig,
  BoardTicketViewModel,
} from "@/modules/board/presentation/types/boardView.types";

const EMPTY_BOARD_TICKETS: readonly BoardTicketViewModel[] = [];

type BuildStableBoardColumnTicketsInput = {
  columns: BoardColumnConfig[];
  boardTicketIds: BoardTicketIds;
  ticketViewModelById: Map<string, BoardTicketViewModel>;
  previousBoardTicketIds?: BoardTicketIds | null;
  previousTicketViewModelById?: Map<string, BoardTicketViewModel> | null;
  previousBoardColumnTickets?: BoardColumnTickets | null;
};

const canReuseColumnTickets = ({
  nextTicketIds,
  previousTicketIds,
  previousTicketViewModelById,
  previousTickets,
  ticketViewModelById,
}: {
  nextTicketIds: string[];
  previousTicketIds?: string[];
  previousTicketViewModelById?: Map<string, BoardTicketViewModel> | null;
  previousTickets?: readonly BoardTicketViewModel[];
  ticketViewModelById: Map<string, BoardTicketViewModel>;
}): boolean => {
  if (previousTicketIds == null || previousTickets == null) {
    return false;
  }

  if (
    previousTicketIds === nextTicketIds &&
    previousTicketViewModelById === ticketViewModelById
  ) {
    return true;
  }

  if (previousTickets.length !== nextTicketIds.length) {
    return false;
  }

  for (let index = 0; index < nextTicketIds.length; index += 1) {
    if (
      previousTickets[index] !== ticketViewModelById.get(nextTicketIds[index])
    ) {
      return false;
    }
  }

  return true;
};

export const buildStableBoardColumnTickets = ({
  columns,
  boardTicketIds,
  ticketViewModelById,
  previousBoardTicketIds,
  previousTicketViewModelById,
  previousBoardColumnTickets,
}: BuildStableBoardColumnTicketsInput): BoardColumnTickets => {
  const nextBoardColumnTickets: BoardColumnTickets = new Map();

  for (const column of columns) {
    const nextTicketIds = boardTicketIds[column.id] ?? [];
    const previousTickets = previousBoardColumnTickets?.get(column.id);
    const previousTicketIds = previousBoardTicketIds?.[column.id];

    if (
      canReuseColumnTickets({
        nextTicketIds,
        previousTicketIds,
        previousTicketViewModelById,
        previousTickets,
        ticketViewModelById,
      })
    ) {
      nextBoardColumnTickets.set(
        column.id,
        previousTickets ?? EMPTY_BOARD_TICKETS
      );
      continue;
    }

    const ticketsForColumn: BoardTicketViewModel[] = [];

    for (const ticketId of nextTicketIds) {
      const ticket = ticketViewModelById.get(ticketId);

      if (ticket != null) {
        ticketsForColumn.push(ticket);
      }
    }

    nextBoardColumnTickets.set(
      column.id,
      ticketsForColumn.length > 0 ? ticketsForColumn : EMPTY_BOARD_TICKETS
    );
  }

  return nextBoardColumnTickets;
};
