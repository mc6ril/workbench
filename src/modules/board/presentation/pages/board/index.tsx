"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import { getAccessibilityId } from "@/shared/a11y";
import Loader from "@/shared/design-system/loader";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import { useTranslations } from "@/shared/i18n";
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
import CreateTicketForm, {
  type CreateTicketFormValues,
} from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm";
import TicketCard from "@/modules/board/presentation/components/ticket/ticketCard/TicketCard";
import { useBoardColumns } from "@/modules/board/presentation/hooks/board/useBoardColumns";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useBoardDnD } from "@/modules/board/presentation/hooks/board/useBoardDnD";
import { useBoardTickets } from "@/modules/board/presentation/hooks/board/useBoardTickets";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { useCreateTicket } from "@/modules/board/presentation/hooks/ticket/useCreateTicket";
import { usePrefetchTicketDetail } from "@/modules/board/presentation/hooks/ticket/usePrefetchTicketDetail";
import { useTicketAssigneesByProjectId } from "@/modules/board/presentation/hooks/ticket/useTicketAssigneesByProjectId";
import { useTickets } from "@/modules/board/presentation/hooks/ticket/useTickets";
import { useFilterStore } from "@/modules/board/presentation/stores/useFilterStore";
import type { BoardColumnConfig } from "@/modules/board/presentation/types/boardView.types";
import { getBoardColumnDisplayName } from "@/modules/board/presentation/utils/columnI18n";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const layoutId = useMemo(() => getAccessibilityId("board-layout"), []);
  const dndContextId = useMemo(() => {
    return getAccessibilityId(`board-dnd-context-${projectId}`);
  }, [projectId]);
  const tBoard = useTranslations("pages.board");
  const legacyTicketId = searchParams.get("ticket");
  const tCreateForm = useTranslations("pages.board.createTicketForm");
  const tColumns = useTranslations("pages.board.columns");
  const isCreateTicketModalOpen = searchParams.get("createTicket") === "1";
  const { canMoveTicket, canCreateTicket } = useProjectPermissions();
  const createTicketMutation = useCreateTicket();
  const prefetchTicketDetail = usePrefetchTicketDetail();

  const replaceSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "") {
          params.delete(key);
          continue;
        }
        params.set(key, value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
        feedback: "none",
      });
    },
    [pathname, router, searchParams]
  );

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
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.columnId ||
      filters.priority ||
      filters.assigneeUserId ||
      filters.unassignedOnly
    );
  }, [filters]);
  const shouldLoadProjectWideTickets =
    isCreateTicketModalOpen &&
    (hasActiveFilters || effectiveSearch.trim() !== "");
  const { data: projectWideTickets = [] } = useTickets(
    projectId,
    undefined,
    "",
    {
      enabled: shouldLoadProjectWideTickets,
    }
  );
  const ticketsForCreatePosition = shouldLoadProjectWideTickets
    ? projectWideTickets
    : tickets;
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

  const closeCreateTicketModal = useCallback(() => {
    replaceSearchParams({ createTicket: null });
  }, [replaceSearchParams]);

  const statusOptions = useMemo(() => {
    const currentColumns = boardConfiguration?.columns ?? [];
    return currentColumns.map((column) => ({
      value: column.id,
      label: getBoardColumnDisplayName(column, tColumns),
    }));
  }, [boardConfiguration?.columns, tColumns]);

  const createTicketErrorMessage =
    createTicketMutation.error instanceof Error
      ? createTicketMutation.error.message
      : undefined;

  useEffect(() => {
    if (!legacyTicketId) {
      return;
    }
    router.replace(buildTicketDetailRoute(projectId, legacyTicketId), {
      scroll: false,
    });
  }, [legacyTicketId, projectId, router]);

  const handleCreateTicketSubmit = useCallback(
    async (values: CreateTicketFormValues): Promise<void> => {
      if (!canCreateTicket) {
        return;
      }
      await createTicketMutation.mutateAsync({
        projectId,
        title: values.title,
        description: values.description ?? null,
        columnId: values.columnId,
        position: ticketsForCreatePosition.filter(
          (ticket) => ticket.columnId === values.columnId
        ).length,
      });
      closeCreateTicketModal();
    },
    [
      canCreateTicket,
      closeCreateTicketModal,
      createTicketMutation,
      projectId,
      ticketsForCreatePosition,
    ]
  );

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
            columnOptions={statusOptions}
            isSubmitting={createTicketMutation.isPending}
            errorMessage={createTicketErrorMessage}
            onCancel={closeCreateTicketModal}
            onSubmit={handleCreateTicketSubmit}
          />
        )}
      </Modal>
    </section>
  );
};

export default BoardLayout;
