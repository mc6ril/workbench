"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import BoardView from "@/presentation/components/board/boardView/BoardView";
import TicketCard from "@/presentation/components/ticket/ticketCard/TicketCard";
import TicketDetailView from "@/presentation/components/ticket/ticketDetailView/TicketDetailView";
import Loader from "@/presentation/components/ui/Loader";
import Modal from "@/presentation/components/ui/Modal";
import { useBoardColumns } from "@/presentation/hooks/board/useBoardColumns";
import { useBoardConfiguration } from "@/presentation/hooks/board/useBoardConfiguration";
import { useBoardDnD } from "@/presentation/hooks/board/useBoardDnD";
import { useBoardTickets } from "@/presentation/hooks/board/useBoardTickets";
import { useProject } from "@/presentation/hooks/project";
import { useTickets } from "@/presentation/hooks/ticket/useTickets";
import { useProjectPermissions } from "@/presentation/providers/permissions";
import { useFilterStore } from "@/presentation/stores/useFilterStore";
import { useSortStore } from "@/presentation/stores/useSortStore";

import { getAccessibilityId } from "@/shared/a11y";
import { useTranslation } from "@/shared/i18n";
import type { BoardColumnConfig } from "@/shared/types/board";
import { normalizeTicketSearch } from "@/shared/utils/ticketUtils";

import styles from "./styles.module.scss";

const BoardLayout = ({ projectId }: { projectId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const layoutId = useMemo(() => getAccessibilityId("board-layout"), []);
  const tTicket = useTranslation("pages.ticketDetail.page");
  const selectedTicketId = searchParams.get("ticket");
  const { canMoveTicket, isLoading: isPermissionsLoading } =
    useProjectPermissions();

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
  const filters = useFilterStore((state) => state.filters);
  const sort = useSortStore((state) => state.sort);
  const search = useFilterStore((state) => state.search);
  const effectiveSearch = useMemo(() => {
    return normalizeTicketSearch(search, project?.shortCode);
  }, [project?.shortCode, search]);
  const { data: tickets = [] } = useTickets(
    projectId,
    filters,
    sort,
    effectiveSearch,
    { useProjectWideCache: true }
  );

  const { columns, columnById } = useBoardColumns(boardConfiguration);
  const { filteredTickets, ticketViewModelById } = useBoardTickets({
    projectId,
    tickets,
    projectShortCode: project?.shortCode,
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

  const renderColumnProps = useMemo(() => {
    return (column: BoardColumnConfig) => {
      const ticketsForColumn = boardColumnTickets.get(column.id) ?? [];
      return {
        tickets: ticketsForColumn,
        onTicketClick: handleEditTicket,
      };
    };
  }, [boardColumnTickets, handleEditTicket]);

  if (isPermissionsLoading) {
    return <Loader variant="full-page" />;
  }

  return (
    <section className={styles["board-layout"]} aria-labelledby={layoutId}>
      <DndContext
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
