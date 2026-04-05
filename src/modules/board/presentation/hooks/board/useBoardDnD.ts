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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import type { BoardColumnTickets } from "./types";

import type { Ticket } from "@/modules/board/core/domain/ticket.types";
import type {
  BoardTicketIds,
  TicketLocationIndex,
} from "@/modules/board/core/usecases/board/boardDnD";
import {
  buildBoardTicketIds,
  buildNextBoardFromDragOver,
  buildTicketLocationIndex,
  cloneTicketLocationIndex,
  getBoardDragOverColumnId,
  getTicketLocation,
  syncTicketLocationIndexColumns,
} from "@/modules/board/core/usecases/board/boardDnD";
import { buildStableBoardColumnTickets } from "@/modules/board/presentation/hooks/board/useBoardDnD.helpers";
import { useMoveAndReorderTicket } from "@/modules/board/presentation/hooks/ticket/useMoveAndReorderTicket";
import { useReorderTicket } from "@/modules/board/presentation/hooks/ticket/useReorderTicket";
import type {
  BoardColumnConfig,
  BoardTicketViewModel,
} from "@/modules/board/presentation/types/boardView.types";

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

type DragSnapshot = {
  boardTicketIds: BoardTicketIds;
  locationIndex: TicketLocationIndex;
};

type BoardColumnTicketsCache = {
  boardTicketIds: BoardTicketIds | null;
  ticketViewModelById: Map<string, BoardTicketViewModel> | null;
  tickets: BoardColumnTickets;
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
  const dragSnapshotRef = useRef<DragSnapshot | null>(null);
  const draftBoardLocationIndexRef = useRef<TicketLocationIndex | null>(null);
  const pendingDragOverRef = useRef<{
    activeId: string;
    overId: string;
  } | null>(null);
  const dragOverRafRef = useRef<number | null>(null);
  const boardColumnTicketsCacheRef = useRef<BoardColumnTicketsCache>({
    boardTicketIds: null,
    ticketViewModelById: null,
    tickets: new Map(),
  });

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
  const baseBoardTicketLocationIndex = useMemo(() => {
    return buildTicketLocationIndex(baseBoardTicketIds);
  }, [baseBoardTicketIds]);

  const boardTicketIds = draftBoardTicketIds ?? baseBoardTicketIds;

  const boardColumnTickets = useMemo<BoardColumnTickets>(() => {
    const cache = boardColumnTicketsCacheRef.current;
    const nextBoardColumnTickets = buildStableBoardColumnTickets({
      columns,
      boardTicketIds,
      ticketViewModelById,
      previousBoardTicketIds: cache.boardTicketIds,
      previousTicketViewModelById: cache.ticketViewModelById,
      previousBoardColumnTickets: cache.tickets,
    });

    boardColumnTicketsCacheRef.current = {
      boardTicketIds,
      ticketViewModelById,
      tickets: nextBoardColumnTickets,
    };

    return nextBoardColumnTickets;
  }, [boardTicketIds, columns, ticketViewModelById]);

  const activeTicket = useMemo(() => {
    if (!activeTicketId) {
      return null;
    }

    return ticketViewModelById.get(activeTicketId) ?? null;
  }, [activeTicketId, ticketViewModelById]);

  const cancelPendingDragOver = useCallback(() => {
    if (dragOverRafRef.current != null) {
      window.cancelAnimationFrame(dragOverRafRef.current);
      dragOverRafRef.current = null;
    }

    pendingDragOverRef.current = null;
  }, []);

  const flushPendingDragOver = useCallback(() => {
    const pending = pendingDragOverRef.current;
    pendingDragOverRef.current = null;
    dragOverRafRef.current = null;

    if (pending == null) {
      return;
    }

    setDraftBoardTicketIds((previous) => {
      const currentBoard = previous ?? baseBoardTicketIds;
      const currentLocationIndex =
        draftBoardLocationIndexRef.current ??
        cloneTicketLocationIndex(baseBoardTicketLocationIndex);
      const sourceColumnId =
        getTicketLocation(pending.activeId, currentLocationIndex)?.columnId ??
        null;
      const targetColumnId = getBoardDragOverColumnId(
        pending.overId,
        currentLocationIndex
      );
      const nextBoard = buildNextBoardFromDragOver(
        currentBoard,
        currentLocationIndex,
        pending.activeId,
        pending.overId
      );

      if (
        nextBoard === currentBoard ||
        sourceColumnId == null ||
        targetColumnId == null
      ) {
        return currentBoard;
      }

      syncTicketLocationIndexColumns(currentLocationIndex, nextBoard, [
        sourceColumnId,
        targetColumnId,
      ]);
      draftBoardLocationIndexRef.current = currentLocationIndex;

      return nextBoard;
    });
  }, [baseBoardTicketIds, baseBoardTicketLocationIndex]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeId = String(event.active.id);
      cancelPendingDragOver();
      dragSnapshotRef.current = {
        boardTicketIds: baseBoardTicketIds,
        locationIndex: baseBoardTicketLocationIndex,
      };
      draftBoardLocationIndexRef.current = cloneTicketLocationIndex(
        baseBoardTicketLocationIndex
      );
      setDraftBoardTicketIds(baseBoardTicketIds);
      setActiveTicketId(activeId);
    },
    [baseBoardTicketIds, baseBoardTicketLocationIndex, cancelPendingDragOver]
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
    cancelPendingDragOver();
    dragSnapshotRef.current = null;
    draftBoardLocationIndexRef.current = null;
    setDraftBoardTicketIds(null);
    setActiveTicketId(null);
  }, [cancelPendingDragOver]);

  useEffect(() => {
    return () => {
      cancelPendingDragOver();
    };
  }, [cancelPendingDragOver]);

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

      cancelPendingDragOver();
      setActiveTicketId(null);
      dragSnapshotRef.current = null;

      if (snapshot == null) {
        draftBoardLocationIndexRef.current = null;
        setDraftBoardTicketIds(null);
        return;
      }

      if (over == null) {
        draftBoardLocationIndexRef.current = null;
        setDraftBoardTicketIds(null);
        return;
      }

      const overId = String(over.id);
      const effectiveBoardTicketIds = draftBoardTicketIds ?? baseBoardTicketIds;
      const currentLocationIndex =
        draftBoardLocationIndexRef.current ??
        cloneTicketLocationIndex(baseBoardTicketLocationIndex);
      const boardAfterDrop = buildNextBoardFromDragOver(
        effectiveBoardTicketIds,
        currentLocationIndex,
        activeId,
        overId
      );
      const effectiveLocationIndex = buildTicketLocationIndex(boardAfterDrop);
      const snapshotLocationIndex = snapshot.locationIndex;
      const finalSourceColumnId =
        getTicketLocation(activeId, effectiveLocationIndex)?.columnId ?? null;
      const initialSourceColumnId =
        getTicketLocation(activeId, snapshotLocationIndex)?.columnId ?? null;

      if (finalSourceColumnId == null || initialSourceColumnId == null) {
        draftBoardLocationIndexRef.current = null;
        setDraftBoardTicketIds(null);
        return;
      }

      const finalSourceIds = boardAfterDrop[finalSourceColumnId] ?? [];
      const initialSourceIds = snapshot.boardTicketIds[initialSourceColumnId] ?? [];
      const noPositionChange =
        finalSourceColumnId === initialSourceColumnId &&
        areIdArraysEqual(finalSourceIds, initialSourceIds);
      if (noPositionChange) {
        draftBoardLocationIndexRef.current = null;
        setDraftBoardTicketIds(null);
        return;
      }

      const finalTargetColumn = columnById.get(finalSourceColumnId);
      if (!finalTargetColumn) {
        draftBoardLocationIndexRef.current = null;
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
          columnId: finalTargetColumn.id,
          position: movedTicketPosition,
          ticketPositions: updatedPositions,
        });
      } catch {
        // Optimistic state is reverted by mutation's onError.
      } finally {
        draftBoardLocationIndexRef.current = null;
        setDraftBoardTicketIds(null);
      }
    },
    [
      baseBoardTicketIds,
      baseBoardTicketLocationIndex,
      cancelPendingDragOver,
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
