"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import { getAccessibilityId } from "@/shared/a11y";
import Loader from "@/shared/design-system/loader";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import { PlanFeature, useFeatureAccess } from "@/shared/featureAccess";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions";
import type { BoardColumnConfig } from "@/modules/board/core/domain/types/board.types";
import BoardView from "@/modules/board/presentation/components/board/boardView/BoardView";
import CreateTicketForm from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm";
import TicketCard from "@/modules/board/presentation/components/ticket/ticketCard/TicketCard";
import TicketDetailView from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView";
import { useBoardColumns } from "@/modules/board/presentation/hooks/board/useBoardColumns";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useBoardDnD } from "@/modules/board/presentation/hooks/board/useBoardDnD";
import { useBoardTickets } from "@/modules/board/presentation/hooks/board/useBoardTickets";
import { useEpics } from "@/modules/board/presentation/hooks/epic/useEpics";
import { useAddTicketLabels, useLabels } from "@/modules/board/presentation/hooks/label";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { useCreateTicket } from "@/modules/board/presentation/hooks/ticket/useCreateTicket";
import { useTickets } from "@/modules/board/presentation/hooks/ticket/useTickets";
import { useFilterStore } from "@/modules/board/presentation/stores/useFilterStore";
import { useSortStore } from "@/modules/board/presentation/stores/useSortStore";
import {
  buildTicketCode,
  normalizeTicketSearch,
} from "@/modules/board/utils/ticketUtils";

const BoardLayout = ({ projectId }: { projectId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const layoutId = useMemo(() => getAccessibilityId("board-layout"), []);
  const tBoard = useTranslation("pages.board");
  const tTicket = useTranslation("pages.ticketDetail.page");
  const selectedTicketId = searchParams.get("ticket");
  const tCreateForm = useTranslation("pages.board.createTicketForm");
  const isCreateTicketModalOpen = searchParams.get("createTicket") === "1";
  const {
    canMoveTicket,
    canCreateTicket,
    isLoading: isPermissionsLoading,
  } = useProjectPermissions();
  const createTicketMutation = useCreateTicket();
  const addTicketLabelsMutation = useAddTicketLabels();

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
  const { data: epics = [] } = useEpics(projectId, {
    enabled: isCreateTicketModalOpen,
  });
  const { data: labels = [] } = useLabels(projectId, {
    enabled: isCreateTicketModalOpen,
  });
  const { hasAccess: hasEpicsAccess } = useFeatureAccess(PlanFeature.EPICS);
  const { data: projectShortCode } = useProjectShortCode(projectId);
  const filters = useFilterStore((state) => state.filters);
  const sort = useSortStore((state) => state.sort);
  const search = useFilterStore((state) => state.search);
  const effectiveSearch = useMemo(() => {
    return normalizeTicketSearch(search, projectShortCode);
  }, [projectShortCode, search]);
  const { data: tickets = [] } = useTickets(
    projectId,
    filters,
    sort,
    effectiveSearch,
    { useProjectWideCache: true }
  );
  const hasActiveFilters = useMemo(() => {
    if (filters.status || filters.epicId || filters.priority) {
      return true;
    }

    if (
      Object.prototype.hasOwnProperty.call(filters, "parentId") ||
      Object.prototype.hasOwnProperty.call(filters, "sprintId")
    ) {
      return true;
    }

    return Array.isArray(filters.labelIds) && filters.labelIds.length > 0;
  }, [filters]);
  const shouldLoadProjectWideTicketsForCreate =
    isCreateTicketModalOpen &&
    (hasActiveFilters || effectiveSearch.trim() !== "");
  const { data: projectWideTickets = [] } = useTickets(
    projectId,
    undefined,
    undefined,
    "",
    {
      enabled: shouldLoadProjectWideTicketsForCreate,
      useProjectWideCache: true,
    }
  );
  const ticketsForCreatePosition = shouldLoadProjectWideTicketsForCreate
    ? projectWideTickets
    : tickets;

  const { columns, columnById } = useBoardColumns(boardConfiguration);
  const { filteredTickets, ticketViewModelById } = useBoardTickets({
    projectId,
    tickets,
    projectShortCode: projectShortCode,
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

    const humanReadableCode =
      buildTicketCode(projectShortCode, selectedTicket.codeNumber) ??
      selectedTicket.codeNumber;

    const ticketCode = tTicket("ticketCode", {
      code: humanReadableCode,
    });

    return `${ticketCode} ${selectedTicket.title}`;
  }, [projectShortCode, selectedTicket, tTicket]);

  const renderColumnProps = useMemo(() => {
    return (column: BoardColumnConfig) => {
      const ticketsForColumn = boardColumnTickets.get(column.id) ?? [];
      return {
        tickets: ticketsForColumn,
        onTicketClick: handleEditTicket,
      };
    };
  }, [boardColumnTickets, handleEditTicket]);

  const closeCreateTicketModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("createTicket");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  const statusOptions = useMemo(() => {
    const currentColumns = boardConfiguration?.columns ?? [];
    return currentColumns.map((column) => ({
      value: column.status,
      label: column.name,
    }));
  }, [boardConfiguration?.columns]);

  const epicOptions = useMemo(() => {
    return epics.map((epic) => ({
      value: epic.id,
      label: epic.name,
    }));
  }, [epics]);

  const labelOptions = useMemo(() => {
    return labels.map((label) => ({
      value: label.id,
      label: label.name,
    }));
  }, [labels]);

  const createTicketErrorMessage =
    createTicketMutation.error instanceof Error
      ? createTicketMutation.error.message
      : undefined;

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
      <Modal
        isOpen={isCreateTicketModalOpen}
        onClose={closeCreateTicketModal}
        title={tCreateForm("title")}
      >
        {statusOptions.length === 0 ? (
          <Text variant="small">{tBoard("createTicketForm.noStatusHint")}</Text>
        ) : !canCreateTicket ? (
          <Text variant="small">{tCreateForm("readOnlyHint")}</Text>
        ) : (
          <CreateTicketForm
            statusOptions={statusOptions}
            epicOptions={epicOptions}
            labelOptions={labelOptions}
            showEpicField={hasEpicsAccess}
            isSubmitting={createTicketMutation.isPending}
            errorMessage={createTicketErrorMessage}
            onCancel={closeCreateTicketModal}
            onSubmit={async (values) => {
              if (!canCreateTicket) {
                return;
              }

              const createdTicket = await createTicketMutation.mutateAsync({
                projectId,
                title: values.title,
                description: values.description ?? null,
                status: values.status,
                epicId: values.epicId ?? null,
                position: ticketsForCreatePosition.filter(
                  (ticket) => ticket.status === values.status
                ).length,
              });

              if (values.labelIds && values.labelIds.length > 0) {
                await addTicketLabelsMutation.mutateAsync({
                  ticketId: createdTicket.id,
                  labelIds: values.labelIds,
                });
              }

              closeCreateTicketModal();
            }}
          />
        )}
      </Modal>
    </section>
  );
};

export default BoardLayout;
