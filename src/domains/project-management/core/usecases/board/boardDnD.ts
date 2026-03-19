import type { Ticket } from "@/domains/project-management/core/domain/schema/ticket.schema";

import { BOARD_COLUMN_DROP_PREFIX } from "@/shared/constants/board";
import type { BoardColumnConfig } from "@/domains/project-management/core/domain/types/board.types";

export type BoardTicketIds = Record<string, string[]>;

export type TicketLocation = {
  columnId: string;
  index: number;
};

export type TicketLocationIndex = Record<string, TicketLocation>;

const isColumnDropId = (id: string): boolean => {
  return id.startsWith(BOARD_COLUMN_DROP_PREFIX);
};

const getColumnIdFromDropId = (id: string): string => {
  return id.slice(BOARD_COLUMN_DROP_PREFIX.length);
};

const moveItem = (
  items: string[],
  fromIndex: number,
  toIndex: number
): string[] => {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
};

export const buildBoardTicketIds = (
  columns: BoardColumnConfig[],
  tickets: Ticket[]
): BoardTicketIds => {
  const boardTicketIds: BoardTicketIds = {};

  for (const column of columns) {
    boardTicketIds[column.id] = [];
  }

  const orderedTickets = [...tickets].sort((a, b) => a.position - b.position);

  for (const ticket of orderedTickets) {
    const targetColumn = columns.find(
      (column) => column.status === ticket.status
    );
    if (targetColumn) {
      boardTicketIds[targetColumn.id].push(ticket.id);
    }
  }

  return boardTicketIds;
};

export const buildTicketLocationIndex = (
  boardTicketIds: BoardTicketIds
): TicketLocationIndex => {
  const index: TicketLocationIndex = {};

  for (const [columnId, ids] of Object.entries(boardTicketIds)) {
    for (let position = 0; position < ids.length; position += 1) {
      index[ids[position]] = {
        columnId,
        index: position,
      };
    }
  }

  return index;
};

const resolveTargetColumnId = (
  overId: string,
  ticketLocationIndex: TicketLocationIndex
): string | null => {
  if (isColumnDropId(overId)) {
    return getColumnIdFromDropId(overId);
  }

  return ticketLocationIndex[overId]?.columnId ?? null;
};

export const getTicketLocation = (
  ticketId: string,
  ticketLocationIndex: TicketLocationIndex
): TicketLocation | null => {
  return ticketLocationIndex[ticketId] ?? null;
};

export const buildNextBoardFromDragOver = (
  previous: BoardTicketIds,
  previousLocationIndex: TicketLocationIndex,
  activeId: string,
  overId: string
): BoardTicketIds => {
  const sourceLocation = getTicketLocation(activeId, previousLocationIndex);
  const targetColumnId = resolveTargetColumnId(overId, previousLocationIndex);

  if (sourceLocation == null || targetColumnId == null) {
    return previous;
  }

  const { columnId: sourceColumnId, index: sourceIndex } = sourceLocation;

  if (sourceColumnId === targetColumnId) {
    if (overId === activeId || isColumnDropId(overId)) {
      return previous;
    }

    const sourceIds = previous[sourceColumnId] ?? [];
    const overLocation = getTicketLocation(overId, previousLocationIndex);
    const overIndex = overLocation?.index ?? -1;

    if (overIndex === -1 || sourceIndex === overIndex) {
      return previous;
    }

    return {
      ...previous,
      [sourceColumnId]: moveItem(sourceIds, sourceIndex, overIndex),
    };
  }

  const sourceIds = previous[sourceColumnId] ?? [];
  const targetIds = previous[targetColumnId] ?? [];
  const nextSourceIds = sourceIds.filter((id) => id !== activeId);
  const overLocation = getTicketLocation(overId, previousLocationIndex);
  const targetIndex = isColumnDropId(overId)
    ? targetIds.length
    : (overLocation?.index ?? -1);
  const normalizedTargetIndex =
    targetIndex === -1 ? targetIds.length : targetIndex;
  const nextTargetIds = [...targetIds];
  nextTargetIds.splice(normalizedTargetIndex, 0, activeId);

  return {
    ...previous,
    [sourceColumnId]: nextSourceIds,
    [targetColumnId]: nextTargetIds,
  };
};
