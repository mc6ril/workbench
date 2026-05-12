"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import { getAccessibilityId } from "@/shared/a11y";
import Loader from "@/shared/design-system/loader";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { buildTicketDetailRoute } from "@/shared/utils/routes";

import styles from "./styles.module.scss";

import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import type { BoardConfiguration } from "@/modules/board/core/domain/board.types";
import type {
  Ticket,
  TicketFilters,
} from "@/modules/board/core/domain/ticket.types";
import BoardView from "@/modules/board/presentation/components/board/boardView/BoardView";
import TicketCard from "@/modules/board/presentation/components/ticket/ticketCard/TicketCard";
import { useBoardColumns } from "@/modules/board/presentation/hooks/board/useBoardColumns";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useBoardDnD } from "@/modules/board/presentation/hooks/board/useBoardDnD";
import { useBoardTickets } from "@/modules/board/presentation/hooks/board/useBoardTickets";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { usePrefetchTicketDetail } from "@/modules/board/presentation/hooks/ticket/usePrefetchTicketDetail";
import { useTicketAssigneesByProjectId } from "@/modules/board/presentation/hooks/ticket/useTicketAssigneesByProjectId";
import { useTickets } from "@/modules/board/presentation/hooks/ticket/useTickets";
import { useFilterStore } from "@/modules/board/presentation/stores/useFilterStore";
import type { BoardColumnConfig } from "@/modules/board/presentation/types/boardView.types";
import { normalizeTicketSearch } from "@/modules/board/utils/ticketUtils";

const EMPTY_FILTERS: TicketFilters = {};

type BoardLayoutProps = {
  projectId: string;
  initialBoardConfiguration?: BoardConfiguration;
  initialTickets?: Ticket[];
  initialProjectShortCode?: string | null;
};

const BoardLayout = ({
  projectId,
  initialBoardConfiguration,
  initialTickets,
  initialProjectShortCode,
}: BoardLayoutProps) => {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const layoutId = useMemo(() => getAccessibilityId("board-layout"), []);
  const dndContextId = useMemo(() => {
    return getAccessibilityId(`board-dnd-context-${projectId}`);
  }, [projectId]);
  const legacyTicketId = searchParams.get("ticket");
  const { canMoveTicket } = useProjectPermissions();
  const prefetchTicketDetail = usePrefetchTicketDetail();

  const handleOpenTicketDetail = useCallback(
    (ticketId: string) => {
      router.push(buildTicketDetailRoute(projectId, ticketId));
    },
    [projectId, router]
  );

  const {
    data: boardConfiguration,
    isLoading,
    error,
  } = useBoardConfiguration(projectId, {
    initialData: initialBoardConfiguration,
  });
  const { data: projectShortCode } = useProjectShortCode(projectId, {
    initialData: initialProjectShortCode,
  });
  const filterProjectId = useFilterStore((state) => state.projectId);
  const rawFilters = useFilterStore((state) => state.filters);
  const rawSearch = useFilterStore((state) => state.search);
  const isFilterStoreReady = filterProjectId === projectId;
  const filters = isFilterStoreReady ? rawFilters : EMPTY_FILTERS;
  const search = isFilterStoreReady ? rawSearch : "";
  const effectiveSearch = useMemo(() => {
    return normalizeTicketSearch(search, projectShortCode);
  }, [projectShortCode, search]);
  const shouldUseInitialTickets =
    !isFilterStoreReady ||
    (!filters.columnId &&
      !filters.priority &&
      !filters.assigneeUserId &&
      !filters.unassignedOnly &&
      effectiveSearch.trim() === "");
  const { data: tickets = [], isLoading: isTicketsLoading } = useTickets(
    projectId,
    filters,
    effectiveSearch,
    {
      initialData: shouldUseInitialTickets ? initialTickets : undefined,
    }
  );
  const { data: ticketAssigneesByProjectId = {} } =
    useTicketAssigneesByProjectId(projectId);

  const { columns, columnById } = useBoardColumns(boardConfiguration);
  const { filteredTickets, ticketViewModelById } = useBoardTickets({
    tickets,
    projectShortCode,
    assigneesByTicketId: ticketAssigneesByProjectId,
  });

  const {
    sensors,
    collisionDetection,
    activeTicketId,
    activeTicket,
    boardColumnTickets,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  } = useBoardDnD({
    projectId,
    columns,
    filteredTickets,
    ticketViewModelById,
    columnById,
  });

  const renderColumnProps = useMemo(() => {
    return (column: BoardColumnConfig) => {
      const ticketsForColumn = boardColumnTickets.get(column.id) ?? [];
      return {
        tickets: ticketsForColumn,
        onTicketClick: handleOpenTicketDetail,
        onTicketPrefetch: prefetchTicketDetail,
      };
    };
  }, [boardColumnTickets, handleOpenTicketDetail, prefetchTicketDetail]);

  useEffect(() => {
    if (!legacyTicketId) {
      return;
    }
    router.replace(buildTicketDetailRoute(projectId, legacyTicketId), {
      scroll: false,
    });
  }, [legacyTicketId, projectId, router]);

  if (legacyTicketId) {
    return <Loader variant="full-page" />;
  }

  return (
    <section className={styles["board-layout"]} aria-labelledby={layoutId}>
      <DndContext
        id={dndContextId}
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={canMoveTicket ? onDragStart : undefined}
        onDragOver={canMoveTicket ? onDragOver : undefined}
        onDragEnd={canMoveTicket ? onDragEnd : undefined}
        onDragCancel={canMoveTicket ? onDragCancel : undefined}
      >
        <BoardView
          columns={columns}
          renderColumn={renderColumnProps}
          isDragging={activeTicketId != null}
          isDragEnabled={canMoveTicket}
          isLoading={isLoading || isTicketsLoading}
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
    </section>
  );
};

export default BoardLayout;
