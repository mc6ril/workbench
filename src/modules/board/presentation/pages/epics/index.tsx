import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import ErrorMessage from "@/shared/design-system/error_message";
import Loader from "@/shared/design-system/loader";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import { useTranslation } from "@/shared/i18n";
import { buildProjectRoute } from "@/shared/utils/routes";

import { getEpicsOnboardingProgress } from "./epicsOnboardingProgress";
import styles from "./styles.module.scss";

import { useEpicsGettingStartedStatus } from "@/domains/profile/presentation/hooks/useEpicsGettingStartedStatus";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions";
import BoardOnboardingPanel from "@/modules/board/presentation/components/boardOnboardingPanel/BoardOnboardingPanel";
import {
  ONBOARDING_STEP_STATUS,
  type OnboardingStep,
} from "@/modules/board/presentation/components/boardOnboardingPanel/onboarding.types";
import CreateEpicForm from "@/modules/board/presentation/components/epic/createEpicForm/CreateEpicForm";
import EpicsList from "@/modules/board/presentation/components/epic/epicsList/EpicsList";
import {
  useCreateEpic,
  useEpics,
} from "@/modules/board/presentation/hooks/epic";
import { useEpicQueryParams } from "@/modules/board/presentation/hooks/epic/useEpicQueryParams";
import { useTickets } from "@/modules/board/presentation/hooks/ticket/useTickets";
import { useFilterStore } from "@/modules/board/presentation/stores/useFilterStore";
import {
  filterEpicsByProgress,
  filterEpicsBySearch,
  sortEpics,
} from "@/modules/board/utils/epicUtils";

type Props = {
  projectId: string;
};

const EpicsLayout = ({ projectId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const layoutId = useMemo(() => getAccessibilityId("epics-layout"), []);
  const searchParams = useSearchParams();
  const search = useFilterStore((state) => state.search);
  const tCreateForm = useTranslation("pages.epics.createEpicForm");
  const tOnboarding = useTranslation("pages.epics.onboarding");
  const {
    canCreateEpic,
    canCreateTicket,
    canEditTicket,
    isLoading: isPermissionsLoading,
  } = useProjectPermissions();
  const {
    status: epicsGettingStartedStatus,
    canAutoOpen: canAutoOpenEpicsGettingStarted,
    isLoading: isEpicsGettingStartedLoading,
    isPending: isEpicsGettingStartedPending,
    error: epicsGettingStartedError,
    setStatusAsync,
  } = useEpicsGettingStartedStatus();
  const createEpicMutation = useCreateEpic();
  const completionTriggeredRef = useRef(false);

  //fetch epics
  const { data: epics, isLoading, error } = useEpics(projectId);
  const { epicProgressFilter, epicSortField, epicSortDirection } =
    useEpicQueryParams(searchParams);
  const isCreateEpicModalOpen = searchParams.get("createEpic") === "1";
  const isOnboardingReviewRequested = searchParams.get("onboarding") === "1";
  const shouldLoadEpicsOnboardingSignals =
    epicsGettingStartedStatus === "pending" || isOnboardingReviewRequested;
  const { data: projectTickets = [] } = useTickets(
    projectId,
    undefined,
    undefined,
    "",
    {
      enabled: shouldLoadEpicsOnboardingSignals,
      useProjectWideCache: true,
    }
  );

  const visibleEpics = useMemo(() => {
    const withSearch = filterEpicsBySearch(epics ?? [], search);
    const withProgress = filterEpicsByProgress(withSearch, epicProgressFilter);
    return sortEpics(withProgress, epicSortField, epicSortDirection);
  }, [epicProgressFilter, epicSortDirection, epicSortField, epics, search]);
  const createEpicErrorMessage =
    createEpicMutation.error instanceof Error
      ? createEpicMutation.error.message
      : undefined;
  const linkedTickets = useMemo(() => {
    return projectTickets.filter((ticket) => ticket.epicId !== null);
  }, [projectTickets]);
  const unlinkedTickets = useMemo(() => {
    return projectTickets.filter((ticket) => ticket.epicId === null);
  }, [projectTickets]);
  const linkedTicketTarget = linkedTickets[0] ?? null;
  const unlinkedTicketTarget = unlinkedTickets[0] ?? null;
  const progressingEpicCount = useMemo(() => {
    return (epics ?? []).filter((epic) => epic.progress > 0).length;
  }, [epics]);
  const onboardingProgress = useMemo(() => {
    return getEpicsOnboardingProgress({
      epicCount: epics?.length ?? 0,
      linkedTicketCount: linkedTickets.length,
      progressingEpicCount,
    });
  }, [epics?.length, linkedTickets.length, progressingEpicCount]);

  const updateSearchParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const closeCreateEpicModal = useCallback(() => {
    updateSearchParam("createEpic", null);
  }, [updateSearchParam]);

  const openCreateEpicModal = useCallback(() => {
    updateSearchParam("createEpic", "1");
  }, [updateSearchParam]);

  const openOnboardingReview = useCallback(() => {
    updateSearchParam("onboarding", "1");
  }, [updateSearchParam]);

  const closeOnboardingReview = useCallback(() => {
    updateSearchParam("onboarding", null);
  }, [updateSearchParam]);

  const openBoardTicket = useCallback(
    (ticketId: string) => {
      router.push(
        `${buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}?ticket=${ticketId}`
      );
    },
    [projectId, router]
  );

  const openBoardCreateTicket = useCallback(() => {
    router.push(
      `${buildProjectRoute(projectId, PROJECT_VIEWS.BOARD)}?createTicket=1`
    );
  }, [projectId, router]);

  const handleLinkTicketAction = useCallback(() => {
    if (unlinkedTicketTarget && canEditTicket) {
      openBoardTicket(unlinkedTicketTarget.id);
      return;
    }

    if (canCreateTicket) {
      openBoardCreateTicket();
    }
  }, [
    canCreateTicket,
    canEditTicket,
    openBoardCreateTicket,
    openBoardTicket,
    unlinkedTicketTarget,
  ]);

  const handleTrackProgressAction = useCallback(() => {
    if (!linkedTicketTarget) {
      return;
    }

    openBoardTicket(linkedTicketTarget.id);
  }, [linkedTicketTarget, openBoardTicket]);

  const onboardingErrorMessage = epicsGettingStartedError
    ? epicsGettingStartedError instanceof Error
      ? epicsGettingStartedError.message
      : tOnboarding("genericError")
    : null;
  const onboardingSteps = useMemo<OnboardingStep[]>(() => {
    const linkTicketStatus = onboardingProgress.linkTicketStepStatus;
    const trackProgressStatus = onboardingProgress.trackProgressStepStatus;

    return [
      {
        id: "create-epic",
        title: tOnboarding("steps.createEpic.title"),
        description: tOnboarding("steps.createEpic.description"),
        status: onboardingProgress.createEpicStepStatus,
        actionLabel: canCreateEpic
          ? tOnboarding("steps.createEpic.action")
          : undefined,
        actionAriaLabel: canCreateEpic
          ? tOnboarding("steps.createEpic.actionAriaLabel")
          : undefined,
        onAction: canCreateEpic ? openCreateEpicModal : undefined,
      },
      {
        id: "link-ticket",
        title: tOnboarding("steps.linkTicket.title"),
        description:
          linkTicketStatus === ONBOARDING_STEP_STATUS.BLOCKED
            ? tOnboarding("steps.linkTicket.blockedDescription")
            : tOnboarding("steps.linkTicket.description"),
        status: linkTicketStatus,
        actionLabel:
          linkTicketStatus !== "current"
            ? undefined
            : unlinkedTicketTarget && canEditTicket
              ? tOnboarding("steps.linkTicket.openTicketAction")
              : canCreateTicket
                ? tOnboarding("steps.linkTicket.createTicketAction")
                : undefined,
        actionAriaLabel:
          linkTicketStatus !== "current"
            ? undefined
            : unlinkedTicketTarget && canEditTicket
              ? tOnboarding("steps.linkTicket.openTicketActionAriaLabel")
              : canCreateTicket
                ? tOnboarding("steps.linkTicket.createTicketActionAriaLabel")
                : undefined,
        onAction:
          linkTicketStatus === "current" &&
          ((unlinkedTicketTarget && canEditTicket) || canCreateTicket)
            ? handleLinkTicketAction
            : undefined,
      },
      {
        id: "track-progress",
        title: tOnboarding("steps.trackProgress.title"),
        description:
          trackProgressStatus === ONBOARDING_STEP_STATUS.BLOCKED
            ? tOnboarding("steps.trackProgress.blockedDescription")
            : tOnboarding("steps.trackProgress.description"),
        status: trackProgressStatus,
        actionLabel:
          linkedTicketTarget &&
          trackProgressStatus !== ONBOARDING_STEP_STATUS.BLOCKED
            ? tOnboarding("steps.trackProgress.action")
            : undefined,
        actionAriaLabel:
          linkedTicketTarget &&
          trackProgressStatus !== ONBOARDING_STEP_STATUS.BLOCKED
            ? tOnboarding("steps.trackProgress.actionAriaLabel")
            : undefined,
        onAction:
          linkedTicketTarget &&
          trackProgressStatus !== ONBOARDING_STEP_STATUS.BLOCKED
            ? handleTrackProgressAction
            : undefined,
      },
    ];
  }, [
    canCreateEpic,
    canCreateTicket,
    canEditTicket,
    handleLinkTicketAction,
    handleTrackProgressAction,
    linkedTicketTarget,
    onboardingProgress.createEpicStepStatus,
    onboardingProgress.linkTicketStepStatus,
    onboardingProgress.trackProgressStepStatus,
    openCreateEpicModal,
    tOnboarding,
    unlinkedTicketTarget,
  ]);
  const isOnboardingExpanded =
    !isEpicsGettingStartedLoading &&
    (canAutoOpenEpicsGettingStarted || isOnboardingReviewRequested);

  useEffect(() => {
    if (epicsGettingStartedStatus !== "pending") {
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
    epicsGettingStartedStatus,
    onboardingProgress.areAllStepsCompleted,
    setStatusAsync,
  ]);

  const handleSkipOnboarding = useCallback(async () => {
    await setStatusAsync("skipped");
    closeOnboardingReview();
  }, [closeOnboardingReview, setStatusAsync]);

  const shouldShowFullPageLoader =
    isPermissionsLoading || (isLoading && epics === undefined);

  if (shouldShowFullPageLoader) {
    return <Loader ariaLabel="Loading epics" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <>
      <section className={styles["epics-layout"]} aria-labelledby={layoutId}>
        {isOnboardingExpanded && (
          <BoardOnboardingPanel
            isExpanded
            steps={onboardingSteps}
            errorMessage={onboardingErrorMessage}
            isSkipPending={isEpicsGettingStartedPending}
            onReviewGuide={openOnboardingReview}
            onHideGuide={
              isOnboardingReviewRequested && !canAutoOpenEpicsGettingStarted
                ? closeOnboardingReview
                : undefined
            }
            onSkipOnboarding={
              epicsGettingStartedStatus === "pending"
                ? handleSkipOnboarding
                : undefined
            }
            translationNamespace="pages.epics.onboarding"
          />
        )}
        <EpicsList epics={visibleEpics} />
      </section>

      <Modal
        isOpen={isCreateEpicModalOpen}
        onClose={closeCreateEpicModal}
        title={tCreateForm("title")}
      >
        {!canCreateEpic ? (
          <Text variant="small">{tCreateForm("readOnlyHint")}</Text>
        ) : (
          <CreateEpicForm
            projectId={projectId}
            isSubmitting={createEpicMutation.isPending}
            errorMessage={createEpicErrorMessage}
            onCancel={closeCreateEpicModal}
            onSubmit={async (values) => {
              if (!canCreateEpic) {
                return;
              }

              await createEpicMutation.mutateAsync(values);
              closeCreateEpicModal();
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default EpicsLayout;
