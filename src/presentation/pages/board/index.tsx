import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  closestCenter,
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import type { Ticket } from "@/core/domain/schema/ticket.schema";

import type { BoardColumnConfig } from "@/presentation/components/boardView/BoardView";
import BoardView from "@/presentation/components/boardView/BoardView";
import TicketCard, {
  type TicketCardProps,
} from "@/presentation/components/ticketCard/TicketCard";
import Loader from "@/presentation/components/ui/Loader";
import Modal from "@/presentation/components/ui/Modal";
import { useBoardConfiguration } from "@/presentation/hooks/board/useBoardConfiguration";
import { useProject } from "@/presentation/hooks/project";
import { useMoveTicket } from "@/presentation/hooks/ticket/useMoveTicket";
import { useReorderTicket } from "@/presentation/hooks/ticket/useReorderTicket";
import { useTicketAssigneesByTicketIds } from "@/presentation/hooks/ticket/useTicketAssigneesByTicketIds";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";
import { useFilterStore } from "@/presentation/stores/useFilterStore";

import { getAccessibilityId } from "@/shared/a11y";
import { useTranslation } from "@/shared/i18n";
import {
  buildTicketCode,
  filterTicketsBySearch,
} from "@/shared/utils/ticketUtils";

import styles from "./styles.module.scss";

const COLUMN_DROP_PREFIX = "column:";

const TicketDetailView = dynamic(
  () => import("@/presentation/components/ticketDetailView/TicketDetailView"),
  {
    ssr: false,
    loading: () => <Loader variant="inline" />,
  }
);

type BoardTicketIds = Record<string, string[]>;
type TicketLocation = {
  columnId: string;
  index: number;
};
type TicketLocationIndex = Record<string, TicketLocation>;

const mapTicketToCardProps = (
  ticket: Ticket,
  projectShortCode: string | null | undefined,
  assigneeName?: string | null,
  assigneeAvatarUrl?: string | null
): TicketCardProps => {
  return {
    id: ticket.id,
    title: ticket.title,
    ticketCode: buildTicketCode(projectShortCode, ticket.codeNumber),
    status: ticket.status,
    assigneeName: assigneeName ?? null,
    assigneeAvatarUrl: assigneeAvatarUrl ?? null,
  };
};

const isColumnDropId = (id: string): boolean => {
  return id.startsWith(COLUMN_DROP_PREFIX);
};

const getColumnIdFromDropId = (id: string): string => {
  return id.slice(COLUMN_DROP_PREFIX.length);
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

const BoardLayout = ({ projectId }: { projectId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const layoutId = useMemo(() => getAccessibilityId("board-layout"), []);
  const tTicket = useTranslation("pages.ticketDetail.page");
  const selectedTicketId = searchParams.get("ticket");

  const updateSearchParam = useCallback(
    (ticketId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (ticketId) {
        params.set("ticket", ticketId);
      } else {
        params.delete("ticket");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const handleEditTicket = useCallback(
    (ticketId: string) => {
      updateSearchParam(ticketId);
    },
    [updateSearchParam]
  );
  const {
    data: boardConfiguration,
    isLoading,
    error,
  } = useBoardConfiguration(projectId);

  const { data: project } = useProject(projectId);
  const { data: tickets = [] } = useTickets(projectId);
  const search = useFilterStore((state) => state.search);
  const filteredTickets = useMemo(
    () => filterTicketsBySearch(tickets, search),
    [tickets, search]
  );
  const filteredTicketIds = useMemo(
    () => filteredTickets.map((ticket) => ticket.id),
    [filteredTickets]
  );
  const { data: assigneesByTicketId = {} } =
    useTicketAssigneesByTicketIds(filteredTicketIds);
  const moveTicketMutation = useMoveTicket();
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
    useSensor(PointerSensor, {
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

  const columns = useMemo(() => {
    return (
      boardConfiguration?.columns?.map((column) => ({
        id: column.id,
        title: column.name,
        status: column.status,
        isVisible: column.visible,
      })) ?? []
    );
  }, [boardConfiguration]);

  const baseBoardTicketIds = useMemo(() => {
    return buildBoardTicketIds(columns, filteredTickets);
  }, [columns, filteredTickets]);

  const boardTicketIds = draftBoardTicketIds ?? baseBoardTicketIds;
  const boardTicketLocationIndex = useMemo(() => {
    return buildTicketLocationIndex(boardTicketIds);
  }, [boardTicketIds]);

  const columnById = useMemo(() => {
    const map = new Map<string, BoardColumnConfig>();
    for (const col of columns) {
      map.set(col.id, col);
    }
    return map;
  }, [columns]);

  const ticketCardById = useMemo(() => {
    const map = new Map<string, TicketCardProps>();
    for (const ticket of filteredTickets) {
      const primaryAssignee = assigneesByTicketId[ticket.id]?.[0];
      map.set(
        ticket.id,
        mapTicketToCardProps(
          ticket,
          project?.shortCode,
          primaryAssignee?.displayName,
          primaryAssignee?.avatarUrl
        )
      );
    }
    return map;
  }, [assigneesByTicketId, filteredTickets, project?.shortCode]);

  const boardColumnTickets = useMemo(() => {
    const map = new Map<string, TicketCardProps[]>();

    for (const column of columns) {
      const ticketIds = boardTicketIds[column.id] ?? [];
      const ticketCards = ticketIds
        .map((ticketId) => ticketCardById.get(ticketId))
        .filter((ticket): ticket is TicketCardProps => ticket != null);
      map.set(column.id, ticketCards);
    }

    return map;
  }, [boardTicketIds, columns, ticketCardById]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeId = String(event.active.id);
      dragSnapshotRef.current = baseBoardTicketIds;
      setDraftBoardTicketIds(baseBoardTicketIds);
      setActiveTicketId(activeId);
    },
    [baseBoardTicketIds]
  );

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
        return;
      }

      if (over == null) {
        setDraftBoardTicketIds(null);
        return;
      }

      const effectiveBoardTicketIds = draftBoardTicketIds ?? baseBoardTicketIds;
      const effectiveLocationIndex =
        draftBoardTicketIds != null
          ? boardTicketLocationIndex
          : buildTicketLocationIndex(baseBoardTicketIds);
      const snapshotLocationIndex = buildTicketLocationIndex(snapshot);
      const finalSourceColumnId =
        getTicketLocation(activeId, effectiveLocationIndex)?.columnId ?? null;
      const initialSourceColumnId =
        getTicketLocation(activeId, snapshotLocationIndex)?.columnId ?? null;

      if (finalSourceColumnId == null || initialSourceColumnId == null) {
        return;
      }

      const finalSourceIds = effectiveBoardTicketIds[finalSourceColumnId] ?? [];
      const initialSourceIds = snapshot[initialSourceColumnId] ?? [];
      const noPositionChange =
        finalSourceColumnId === initialSourceColumnId &&
        areIdArraysEqual(finalSourceIds, initialSourceIds);
      if (noPositionChange) {
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

        const sourceIds = effectiveBoardTicketIds[initialSourceColumnId] ?? [];
        const targetIds = effectiveBoardTicketIds[finalSourceColumnId] ?? [];
        const movedTicketPosition = targetIds.indexOf(activeId);

        if (movedTicketPosition === -1) {
          setDraftBoardTicketIds(null);
          return;
        }

        await moveTicketMutation.mutateAsync({
          projectId,
          ticketId: activeId,
          status: finalTargetColumn.status,
          position: movedTicketPosition,
        });

        const updatedPositions = [
          ...sourceIds.map((id, position) => ({
            id,
            position,
          })),
          ...targetIds.map((id, position) => ({
            id,
            position,
          })),
        ];

        await reorderTicketMutation.mutateAsync({
          projectId,
          ticketPositions: updatedPositions,
        });
        setDraftBoardTicketIds(null);
      } catch {
        setDraftBoardTicketIds(null);
      }
    },
    [
      baseBoardTicketIds,
      boardTicketLocationIndex,
      columnById,
      draftBoardTicketIds,
      moveTicketMutation,
      reorderTicketMutation,
      projectId,
    ]
  );

  const renderColumnProps = useMemo(() => {
    return (column: BoardColumnConfig) => {
      const ticketsForColumn = boardColumnTickets.get(column.id) ?? [];
      return {
        tickets: ticketsForColumn,
        onTicketClick: handleEditTicket,
      };
    };
  }, [boardColumnTickets, handleEditTicket]);

  const activeTicket = activeTicketId
    ? ticketCardById.get(activeTicketId)
    : null;

  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) {
      return null;
    }

    return tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  }, [selectedTicketId, tickets]);

  const modalTitle = useMemo(() => {
    const baseTitle = tTicket("title");
    if (!selectedTicket) {
      return baseTitle;
    }

    const ticketCode = tTicket("ticketCode", {
      code: selectedTicket.codeNumber,
    });
    return `${ticketCode} ${selectedTicket.title}`;
  }, [selectedTicket, tTicket]);

  return (
    <section className={styles["board-layout"]} aria-labelledby={layoutId}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          dragSnapshotRef.current = null;
          setDraftBoardTicketIds(null);
          setActiveTicketId(null);
        }}
      >
        <BoardView
          columns={columns}
          renderColumn={renderColumnProps}
          isDragging={activeTicketId != null}
          isLoading={isLoading}
          isEmpty={!boardConfiguration?.columns?.length}
          errorMessage={error?.message}
        />
        <DragOverlay
          dropAnimation={{
            duration: 180,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {activeTicket ? (
            <div className={styles["board-overlay"]}>
              <TicketCard {...activeTicket} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <Modal
        isOpen={Boolean(selectedTicketId)}
        onClose={() => {
          updateSearchParam(null);
        }}
        title={modalTitle}
        size="full"
      >
        {selectedTicketId && (
          <TicketDetailView
            key={selectedTicketId}
            projectId={projectId}
            ticketId={selectedTicketId}
          />
        )}
      </Modal>
    </section>
  );
};

export default BoardLayout;
