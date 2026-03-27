"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import { getAccessibilityId } from "@/shared/a11y";
import Loader from "@/shared/design-system/loader";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import { useTranslation } from "@/shared/i18n";

import { getBoardOnboardingProgress } from "./boardOnboardingProgress";
import styles from "./styles.module.scss";

import { useTicketGettingStartedStatus } from "@/domains/profile/presentation/hooks/useTicketGettingStartedStatus";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions";
import type { BoardColumnConfig } from "@/modules/board/core/domain/types/board.types";
import BoardView from "@/modules/board/presentation/components/board/boardView/BoardView";
import BoardOnboardingPanel from "@/modules/board/presentation/components/boardOnboardingPanel/BoardOnboardingPanel";
import {
  ONBOARDING_STEP_STATUS,
  type OnboardingStep,
} from "@/modules/board/presentation/components/boardOnboardingPanel/onboarding.types";
import CreateTicketForm from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm";
import TicketCard from "@/modules/board/presentation/components/ticket/ticketCard/TicketCard";
import TicketDetailView from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView";
import { useBoardColumns } from "@/modules/board/presentation/hooks/board/useBoardColumns";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useBoardDnD } from "@/modules/board/presentation/hooks/board/useBoardDnD";
import { useBoardTickets } from "@/modules/board/presentation/hooks/board/useBoardTickets";
import { useHasProjectComments } from "@/modules/board/presentation/hooks/comment";
import {
  useAddTicketLabels,
  useLabels,
} from "@/modules/board/presentation/hooks/label";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { useCreateTicket } from "@/modules/board/presentation/hooks/ticket/useCreateTicket";
import { useTicketAssigneesByProjectId } from "@/modules/board/presentation/hooks/ticket/useTicketAssigneesByProjectId";
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
  const tOnboarding = useTranslation("pages.board.onboarding");
  const tTicket = useTranslation("pages.ticketDetail.page");
  const selectedTicketId = searchParams.get("ticket");
  const tCreateForm = useTranslation("pages.board.createTicketForm");
  const isCreateTicketModalOpen = searchParams.get("createTicket") === "1";
  const isOnboardingReviewRequested = searchParams.get("onboarding") === "1";
  const {
    canComment,
    canEditTicket,
    canMoveTicket,
    canCreateTicket,
    isLoading: isPermissionsLoading,
  } = useProjectPermissions();
  const {
    status: gettingStartedStatus,
    canAutoOpen: canAutoOpenGettingStarted,
    isLoading: isGettingStartedLoading,
    isPending: isGettingStartedPending,
    error: gettingStartedError,
    setStatusAsync,
  } = useTicketGettingStartedStatus();
  const createTicketMutation = useCreateTicket();
  const addTicketLabelsMutation = useAddTicketLabels();
  const completionTriggeredRef = useRef(false);

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
      });
    },
    [pathname, router, searchParams]
  );

  const updateSearchParam = useCallback(
    (ticketId: string | null) => {
      replaceSearchParams({
        ticket: ticketId,
      });
    },
    [replaceSearchParams]
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
  const { data: labels = [] } = useLabels(projectId, {
    enabled: isCreateTicketModalOpen,
  });
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
    if (filters.status || filters.priority) {
      return true;
    }

    if (Object.prototype.hasOwnProperty.call(filters, "parentId")) {
      return true;
    }

    return Array.isArray(filters.labelIds) && filters.labelIds.length > 0;
  }, [filters]);
  const shouldLoadProjectWideTicketsForProgress =
    hasActiveFilters || effectiveSearch.trim() !== "";
  const { data: projectWideOnboardingTickets = [] } = useTickets(
    projectId,
    undefined,
    undefined,
    "",
    {
      enabled: shouldLoadProjectWideTicketsForProgress,
      limit: 1,
      useProjectWideCache: true,
    }
  );
  const shouldLoadProjectWideTicketsForCreate =
    isCreateTicketModalOpen && shouldLoadProjectWideTicketsForProgress;
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
  const onboardingTargetTicket =
    projectWideOnboardingTickets[0] ?? tickets[0] ?? null;
  const shouldLoadBoardOnboardingSignals =
    gettingStartedStatus === "pending" || isOnboardingReviewRequested;
  const { data: ticketAssigneesByProjectId = {} } =
    useTicketAssigneesByProjectId(projectId);
  const { data: hasProjectComments = false } = useHasProjectComments(
    projectId,
    {
      enabled: shouldLoadBoardOnboardingSignals,
    }
  );

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
    replaceSearchParams({
      createTicket: null,
    });
  }, [replaceSearchParams]);

  const openCreateTicketModal = useCallback(() => {
    replaceSearchParams({
      createTicket: "1",
    });
  }, [replaceSearchParams]);

  const openOnboardingTicket = useCallback(() => {
    if (!onboardingTargetTicket) {
      return;
    }

    updateSearchParam(onboardingTargetTicket.id);
  }, [onboardingTargetTicket, updateSearchParam]);

  const openOnboardingReview = useCallback(() => {
    replaceSearchParams({
      onboarding: "1",
    });
  }, [replaceSearchParams]);

  const closeOnboardingReview = useCallback(() => {
    replaceSearchParams({
      onboarding: null,
    });
  }, [replaceSearchParams]);

  const statusOptions = useMemo(() => {
    const currentColumns = boardConfiguration?.columns ?? [];
    return currentColumns.map((column) => ({
      value: column.status,
      label: column.name,
    }));
  }, [boardConfiguration?.columns]);

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
  const hasOnboardingTargetTicket = onboardingTargetTicket !== null;
  const assignedTicketCount = useMemo(() => {
    return Object.values(ticketAssigneesByProjectId).filter(
      (assignees) => assignees.length > 0
    ).length;
  }, [ticketAssigneesByProjectId]);
  const onboardingProgress = useMemo(() => {
    return getBoardOnboardingProgress({
      ticketCount: shouldLoadProjectWideTicketsForProgress
        ? projectWideOnboardingTickets.length
        : tickets.length,
      assignedTicketCount,
      commentCount: hasProjectComments ? 1 : 0,
    });
  }, [
    assignedTicketCount,
    hasProjectComments,
    projectWideOnboardingTickets.length,
    shouldLoadProjectWideTicketsForProgress,
    tickets.length,
  ]);
  const isOnboardingExpanded =
    !isGettingStartedLoading &&
    (canAutoOpenGettingStarted || isOnboardingReviewRequested);
  const onboardingErrorMessage = gettingStartedError
    ? gettingStartedError instanceof Error
      ? gettingStartedError.message
      : tOnboarding("genericError")
    : null;
  const onboardingSteps = useMemo<OnboardingStep[]>(() => {
    return [
      {
        id: "create-ticket",
        title: tOnboarding("steps.createTicket.title"),
        description: tOnboarding("steps.createTicket.description"),
        status: onboardingProgress.createTicketStepStatus,
        actionLabel: canCreateTicket
          ? tOnboarding("steps.createTicket.action")
          : undefined,
        actionAriaLabel: canCreateTicket
          ? tOnboarding("steps.createTicket.actionAriaLabel")
          : undefined,
        onAction: canCreateTicket ? openCreateTicketModal : undefined,
      },
      {
        id: "assign-ticket",
        title: tOnboarding("steps.assignTicket.title"),
        description: hasOnboardingTargetTicket
          ? tOnboarding("steps.assignTicket.description")
          : tOnboarding("steps.assignTicket.blockedDescription"),
        status: hasOnboardingTargetTicket
          ? onboardingProgress.assignTicketStepStatus
          : ONBOARDING_STEP_STATUS.BLOCKED,
        actionLabel:
          canEditTicket && hasOnboardingTargetTicket
            ? tOnboarding("steps.assignTicket.action")
            : undefined,
        actionAriaLabel:
          canEditTicket && hasOnboardingTargetTicket
            ? tOnboarding("steps.assignTicket.actionAriaLabel")
            : undefined,
        onAction:
          canEditTicket && hasOnboardingTargetTicket
            ? openOnboardingTicket
            : undefined,
      },
      {
        id: "comment-ticket",
        title: tOnboarding("steps.commentTicket.title"),
        description: hasOnboardingTargetTicket
          ? tOnboarding("steps.commentTicket.description")
          : tOnboarding("steps.commentTicket.blockedDescription"),
        status: hasOnboardingTargetTicket
          ? onboardingProgress.commentTicketStepStatus
          : ONBOARDING_STEP_STATUS.BLOCKED,
        actionLabel:
          canComment && hasOnboardingTargetTicket
            ? tOnboarding("steps.commentTicket.action")
            : undefined,
        actionAriaLabel:
          canComment && hasOnboardingTargetTicket
            ? tOnboarding("steps.commentTicket.actionAriaLabel")
            : undefined,
        onAction:
          canComment && hasOnboardingTargetTicket
            ? openOnboardingTicket
            : undefined,
      },
    ];
  }, [
    canComment,
    canCreateTicket,
    canEditTicket,
    hasOnboardingTargetTicket,
    onboardingProgress.assignTicketStepStatus,
    onboardingProgress.commentTicketStepStatus,
    onboardingProgress.createTicketStepStatus,
    openCreateTicketModal,
    openOnboardingTicket,
    tOnboarding,
  ]);

  useEffect(() => {
    if (gettingStartedStatus !== "pending") {
      completionTriggeredRef.current = false;
      return;
    }

    if (!onboardingProgress.areAllStepsCompleted) {
      completionTriggeredRef.current = false;
      return;
    }

    if (completionTriggeredRef.current) {
      return;
    }

    completionTriggeredRef.current = true;

    void setStatusAsync("completed")
      .then(() => {
        closeOnboardingReview();
      })
      .catch(() => {
        completionTriggeredRef.current = false;
      });
  }, [
    closeOnboardingReview,
    gettingStartedStatus,
    onboardingProgress.areAllStepsCompleted,
    setStatusAsync,
  ]);

  const handleSkipOnboarding = useCallback(async () => {
    await setStatusAsync("skipped");
    closeOnboardingReview();
  }, [closeOnboardingReview, setStatusAsync]);

  if (isPermissionsLoading) {
    return <Loader variant="full-page" />;
  }

  return (
    <section className={styles["board-layout"]} aria-labelledby={layoutId}>
      {isOnboardingExpanded && (
        <BoardOnboardingPanel
          isExpanded
          steps={onboardingSteps}
          errorMessage={onboardingErrorMessage}
          isSkipPending={isGettingStartedPending}
          onReviewGuide={openOnboardingReview}
          onHideGuide={
            isOnboardingReviewRequested && !canAutoOpenGettingStarted
              ? closeOnboardingReview
              : undefined
          }
          onSkipOnboarding={
            gettingStartedStatus === "pending"
              ? handleSkipOnboarding
              : undefined
          }
        />
      )}

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
            labelOptions={labelOptions}
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
