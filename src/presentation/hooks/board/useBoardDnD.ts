"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  closestCenter,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { useMoveAndReorderTicket } from "@/presentation/hooks/ticket/useMoveAndReorderTicket";
import { useReorderTicket } from "@/presentation/hooks/ticket/useReorderTicket";

import { BOARD_COLUMN_DROP_PREFIX } from "@/shared/constants/board";
import type {
  BoardColumnConfig,
  BoardTicketViewModel,
} from "@/shared/types/board";

import type {
  BoardColumnTickets,
  BoardTicketIds,
  TicketLocation,
  TicketLocationIndex,
} from "./types";

const isColumnDropId = (id: string): boolean => {
  return id.startsWith(BOARD_COLUMN_DROP_PREFIX);
};

const getColumnIdFromDropId = (id: string): string => {
  return id.slice(BOARD_COLUMN_DROP_PREFIX.length);
};

const buildBoardTicketIds = (
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

const buildTicketLocationIndex = (
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

const getTicketLocation = (
  ticketId: string,
  ticketLocationIndex: TicketLocationIndex
): TicketLocation | null => {
  const location = ticketLocationIndex[ticketId];
  if (location == null) {
    return null;
  }

  return {
    columnId: location.columnId,
    index: location.index,
  };
};

const buildNextBoardFromDragOver = (
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
      [sourceColumnId]: arrayMove(sourceIds, sourceIndex, overIndex),
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

const areIdArraysEqual = (first: string[], second: string[]): boolean => {
  if (first.length !== second.length) {
    return false;
  }

  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) {
      return false;
    }
  }

  return true;
};

type UseBoardDnDInput = {
  projectId: string;
  columns: BoardColumnConfig[];
  filteredTickets: Ticket[];
  ticketViewModelById: Map<string, BoardTicketViewModel>;
  columnById: Map<string, BoardColumnConfig>;
};

export const useBoardDnD = ({
  projectId,
  columns,
  filteredTickets,
  ticketViewModelById,
  columnById,
}: UseBoardDnDInput) => {
  const moveAndReorderTicketMutation = useMoveAndReorderTicket();
  const reorderTicketMutation = useReorderTicket();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [draftBoardTicketIds, setDraftBoardTicketIds] =
    useState<BoardTicketIds | null>(null);
  const dragSnapshotRef = useRef<BoardTicketIds | null>(null);
  const pendingDragOverRef = useRef<{
    activeId: string;
    overId: string;
  } | null>(null);
  const dragOverRafRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const baseBoardTicketIds = useMemo(() => {
    return buildBoardTicketIds(columns, filteredTickets);
  }, [columns, filteredTickets]);

  const boardTicketIds = draftBoardTicketIds ?? baseBoardTicketIds;

  const boardTicketLocationIndex = useMemo(() => {
    return buildTicketLocationIndex(boardTicketIds);
  }, [boardTicketIds]);

  const boardColumnTickets = useMemo<BoardColumnTickets>(() => {
    const map = new Map<string, BoardTicketViewModel[]>();

    for (const column of columns) {
      const ticketIds = boardTicketIds[column.id] ?? [];
      const ticketCards = ticketIds
        .map((ticketId) => ticketViewModelById.get(ticketId))
        .filter((ticket): ticket is BoardTicketViewModel => ticket != null);
      map.set(column.id, ticketCards);
    }

    return map;
  }, [boardTicketIds, columns, ticketViewModelById]);

  const activeTicket = useMemo(() => {
    if (!activeTicketId) {
      return null;
    }

    return ticketViewModelById.get(activeTicketId) ?? null;
  }, [activeTicketId, ticketViewModelById]);

  const flushPendingDragOver = useCallback(() => {
    const pending = pendingDragOverRef.current;
    pendingDragOverRef.current = null;
    dragOverRafRef.current = null;

    if (pending == null) {
      return;
    }

    setDraftBoardTicketIds((previous) => {
      const currentBoard = previous ?? baseBoardTicketIds;
      const currentLocationIndex = buildTicketLocationIndex(currentBoard);
      return buildNextBoardFromDragOver(
        currentBoard,
        currentLocationIndex,
        pending.activeId,
        pending.overId
      );
    });
  }, [baseBoardTicketIds]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeId = String(event.active.id);
      dragSnapshotRef.current = baseBoardTicketIds;
      setDraftBoardTicketIds(baseBoardTicketIds);
      setActiveTicketId(activeId);
    },
    [baseBoardTicketIds]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const activeId = String(event.active.id);
      const overId = event.over?.id ? String(event.over.id) : null;

      if (overId == null) {
        return;
      }

      pendingDragOverRef.current = {
        activeId,
        overId,
      };

      if (dragOverRafRef.current != null) {
        return;
      }

      dragOverRafRef.current =
        window.requestAnimationFrame(flushPendingDragOver);
    },
    [flushPendingDragOver]
  );

  const handleDragCancel = useCallback(() => {
    dragSnapshotRef.current = null;
    setDraftBoardTicketIds(null);
    setActiveTicketId(null);
  }, []);

  useEffect(() => {
    return () => {
      if (dragOverRafRef.current != null) {
        window.cancelAnimationFrame(dragOverRafRef.current);
      }
    };
  }, []);

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    const cornerCollisions = closestCorners(args);
    if (cornerCollisions.length > 0) {
      return cornerCollisions;
    }

    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }

    return closestCenter(args);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      const activeId = String(active.id);
      const snapshot = dragSnapshotRef.current;

      setActiveTicketId(null);
      dragSnapshotRef.current = null;

      if (snapshot == null) {
        setDraftBoardTicketIds(null);
        return;
      }

      if (over == null) {
        setDraftBoardTicketIds(null);
        return;
      }

      const overId = String(over.id);
      const effectiveBoardTicketIds = draftBoardTicketIds ?? baseBoardTicketIds;
      const currentLocationIndex =
        draftBoardTicketIds != null
          ? boardTicketLocationIndex
          : buildTicketLocationIndex(baseBoardTicketIds);
      const boardAfterDrop = buildNextBoardFromDragOver(
        effectiveBoardTicketIds,
        currentLocationIndex,
        activeId,
        overId
      );
      const effectiveLocationIndex = buildTicketLocationIndex(boardAfterDrop);
      const snapshotLocationIndex = buildTicketLocationIndex(snapshot);
      const finalSourceColumnId =
        getTicketLocation(activeId, effectiveLocationIndex)?.columnId ?? null;
      const initialSourceColumnId =
        getTicketLocation(activeId, snapshotLocationIndex)?.columnId ?? null;

      if (finalSourceColumnId == null || initialSourceColumnId == null) {
        setDraftBoardTicketIds(null);
        return;
      }

      const finalSourceIds = boardAfterDrop[finalSourceColumnId] ?? [];
      const initialSourceIds = snapshot[initialSourceColumnId] ?? [];
      const noPositionChange =
        finalSourceColumnId === initialSourceColumnId &&
        areIdArraysEqual(finalSourceIds, initialSourceIds);
      if (noPositionChange) {
        setDraftBoardTicketIds(null);
        return;
      }

      const finalTargetColumn = columnById.get(finalSourceColumnId);
      if (finalTargetColumn?.status == null) {
        setDraftBoardTicketIds(null);
        return;
      }

      try {
        if (finalSourceColumnId === initialSourceColumnId) {
          const ticketPositions = finalSourceIds.map((id, position) => ({
            id,
            position,
          }));

          await reorderTicketMutation.mutateAsync({
            projectId,
            ticketPositions,
          });
          return;
        }

        const sourceIds = boardAfterDrop[initialSourceColumnId] ?? [];
        const targetIds = boardAfterDrop[finalSourceColumnId] ?? [];
        const movedTicketPosition = targetIds.indexOf(activeId);

        if (movedTicketPosition === -1) {
          setDraftBoardTicketIds(null);
          return;
        }

        const updatedPositions = [
          ...sourceIds.map((id, position) => ({
            id,
            position,
          })),
          ...targetIds.map((id, position) => ({
            id,
            position,
          })),
        ].filter((ticketPosition) => ticketPosition.id !== activeId);

        await moveAndReorderTicketMutation.mutateAsync({
          projectId,
          ticketId: activeId,
          status: finalTargetColumn.status,
          position: movedTicketPosition,
          ticketPositions: updatedPositions,
        });
      } catch {
        // Optimistic state is reverted by mutation's onError.
      } finally {
        setDraftBoardTicketIds(null);
      }
    },
    [
      baseBoardTicketIds,
      boardTicketLocationIndex,
      columnById,
      draftBoardTicketIds,
      moveAndReorderTicketMutation,
      reorderTicketMutation,
      projectId,
    ]
  );

  return {
    sensors,
    collisionDetection,
    activeTicketId,
    activeTicket,
    boardTicketIds,
    boardColumnTickets,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
  };
};
