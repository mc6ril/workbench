import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type { Ticket } from "@/core/domain/schema/ticket.schema";

import type { BoardColumnConfig } from "@/presentation/components/boardView/BoardView";
import BoardView from "@/presentation/components/boardView/BoardView";
import type { TicketCardProps } from "@/presentation/components/ticketCard/TicketCard";
import Loader from "@/presentation/components/ui/Loader";
import Modal from "@/presentation/components/ui/Modal";
import { useBoardConfiguration } from "@/presentation/hooks/board/useBoardConfiguration";
import { useMoveTicket } from "@/presentation/hooks/ticket/useMoveTicket";
import { useReorderTicket } from "@/presentation/hooks/ticket/useReorderTicket";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";
import { useFilterStore } from "@/presentation/stores/useFilterStore";

import { getAccessibilityId } from "@/shared/a11y";
import { useTranslation } from "@/shared/i18n";
import { filterTicketsBySearch } from "@/shared/utils/ticketUtils";

import styles from "./styles.module.scss";

const DRAG_ID_PREFIX = "drag:";
const DROP_ID_PREFIX = "drop:";

const TicketDetailView = dynamic(
  () => import("@/presentation/components/ticketDetailView/TicketDetailView"),
  {
    ssr: false,
    loading: () => <Loader variant="inline" />,
  }
);

/** Minimum vertical drag distance (px) to accept reorder. Below this, leave in place. */
const DROP_THRESHOLD_PX = 40;

const mapTicketToCardProps = (ticket: Ticket): TicketCardProps => {
  return {
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
  };
};

const parseDragId = (
  id: string
): { columnId: string; ticketId: string } | null => {
  if (!id.startsWith(DRAG_ID_PREFIX)) {
    return null;
  }
  const rest = id.slice(DRAG_ID_PREFIX.length);
  const colonIndex = rest.indexOf(":");
  if (colonIndex === -1) {
    return null;
  }
  return {
    columnId: rest.slice(0, colonIndex),
    ticketId: rest.slice(colonIndex + 1),
  };
};

const parseDropId = (
  id: string
): { columnId: string; isEmpty: boolean; targetTicketId?: string } | null => {
  if (!id.startsWith(DROP_ID_PREFIX)) {
    return null;
  }
  const rest = id.slice(DROP_ID_PREFIX.length);
  const colonIndex = rest.indexOf(":");
  if (colonIndex === -1) {
    return null;
  }
  const columnId = rest.slice(0, colonIndex);
  const target = rest.slice(colonIndex + 1);
  const isEmpty = target === "_empty";
  return {
    columnId,
    isEmpty,
    targetTicketId: isEmpty ? undefined : target,
  };
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

  const { data: tickets = [] } = useTickets(projectId);
  const search = useFilterStore((state) => state.search);
  const filteredTickets = useMemo(
    () => filterTicketsBySearch(tickets, search),
    [tickets, search]
  );
  const moveTicketMutation = useMoveTicket();
  const reorderTicketMutation = useReorderTicket();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
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

  const ticketsByStatus = useMemo(() => {
    const grouped = new Map<string, TicketCardProps[]>();
    const sortedTickets = [...filteredTickets].sort(
      (a, b) => a.position - b.position
    );

    for (const ticket of sortedTickets) {
      const existing = grouped.get(ticket.status);
      if (existing) {
        existing.push(mapTicketToCardProps(ticket));
      } else {
        grouped.set(ticket.status, [mapTicketToCardProps(ticket)]);
      }
    }

    return grouped;
  }, [filteredTickets]);

  const columnById = useMemo(() => {
    const map = new Map<string, BoardColumnConfig>();
    for (const col of columns) {
      map.set(col.id, col);
    }
    return map;
  }, [columns]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;
      if (over == null) {
        return;
      }

      const dragPayload = parseDragId(active.id as string);
      const dropPayload = parseDropId(over.id as string);
      if (dragPayload == null || dropPayload == null) {
        return;
      }

      const { ticketId, columnId: sourceColumnId } = dragPayload;
      const { columnId: targetColumnId, isEmpty, targetTicketId } = dropPayload;

      const targetColumn = columnById.get(targetColumnId);
      if (targetColumn?.status == null) {
        return;
      }

      const ticketsInColumn = filteredTickets
        .filter((t) => t.status === targetColumn.status)
        .sort((a, b) => a.position - b.position);

      if (sourceColumnId === targetColumnId) {
        const draggedIndex = ticketsInColumn.findIndex(
          (t) => t.id === ticketId
        );
        if (draggedIndex === -1) {
          return;
        }

        const withoutDragged = ticketsInColumn.filter((t) => t.id !== ticketId);
        let insertIndex: number;
        if (isEmpty || targetTicketId == null) {
          insertIndex = withoutDragged.length;
        } else {
          const dropIndex = withoutDragged.findIndex(
            (t) => t.id === targetTicketId
          );
          const targetIndexInColumn = ticketsInColumn.findIndex(
            (t) => t.id === targetTicketId
          );
          if (dropIndex === -1) {
            insertIndex = withoutDragged.length;
          } else if (draggedIndex < targetIndexInColumn) {
            insertIndex = dropIndex + 1;
          } else {
            insertIndex = dropIndex;
          }
        }

        if (insertIndex === draggedIndex) {
          return;
        }

        const intendedMoveDown = insertIndex > draggedIndex;
        const intendedMoveUp = insertIndex < draggedIndex;
        const draggedEnoughDown = delta.y >= DROP_THRESHOLD_PX;
        const draggedEnoughUp = delta.y <= -DROP_THRESHOLD_PX;
        const shouldApplyReorder =
          (intendedMoveDown && draggedEnoughDown) ||
          (intendedMoveUp && draggedEnoughUp);

        if (!shouldApplyReorder) {
          return;
        }

        const reordered = [
          ...withoutDragged.slice(0, insertIndex),
          ticketsInColumn[draggedIndex],
          ...withoutDragged.slice(insertIndex),
        ];

        const ticketPositions = reordered.map((t, position) => ({
          id: t.id,
          position,
        }));

        reorderTicketMutation.mutate({
          projectId,
          ticketPositions,
        });
        return;
      }

      const ticketsInTarget = ticketsInColumn.filter((t) => t.id !== ticketId);
      const position = ticketsInTarget.length;

      moveTicketMutation.mutate({
        ticketId,
        status: targetColumn.status,
        position,
      });
    },
    [
      columnById,
      filteredTickets,
      moveTicketMutation,
      reorderTicketMutation,
      projectId,
    ]
  );

  const renderColumnProps = useMemo(() => {
    return (column: BoardColumnConfig) => {
      const ticketsForColumn =
        column.status != null ? (ticketsByStatus.get(column.status) ?? []) : [];
      return {
        tickets: ticketsForColumn,
        onTicketClick: handleEditTicket,
      };
    };
  }, [handleEditTicket, ticketsByStatus]);

  return (
    <section className={styles["board-layout"]} aria-labelledby={layoutId}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <BoardView
          columns={columns}
          renderColumn={renderColumnProps}
          isLoading={isLoading}
          isEmpty={!boardConfiguration?.columns?.length}
          errorMessage={error?.message}
        />
      </DndContext>
      <Modal
        isOpen={Boolean(selectedTicketId)}
        onClose={() => {
          updateSearchParam(null);
        }}
        title={tTicket("modalTitle")}
        size="full"
      >
        {selectedTicketId && (
          <TicketDetailView
            key={selectedTicketId}
            projectId={projectId}
            ticketId={selectedTicketId}
            mode="modal"
            onClose={() => {
              updateSearchParam(null);
            }}
          />
        )}
      </Modal>
    </section>
  );
};

export default BoardLayout;
