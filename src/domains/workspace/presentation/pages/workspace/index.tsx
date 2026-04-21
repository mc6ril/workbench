"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  PROJECT_BOARD_EMOJI_PRESETS,
  type ProjectBoardEmojiPreset,
  stripProjectBoardEmojiPrefix,
} from "@/shared/constants/projectBoardEmoji";
import { PAGE_ROUTES, PROJECT_VIEWS } from "@/shared/constants/routes";
import ErrorMessage from "@/shared/design-system/error_message";
import Loader from "@/shared/design-system/loader";
import { getAppErrorCode } from "@/shared/errors/appError";
import { REPOSITORY_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { useTranslations } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { useMarketingRoutes } from "@/shared/i18n/useMarketingRoutes";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { markNavigationStart } from "@/shared/navigationPerf";
import { shouldShowLoading } from "@/shared/utils/queryStatus";
import { buildProjectRoute } from "@/shared/utils/routes";

import styles from "./styles.module.scss";

import { useBillingVisibility } from "@/domains/billing/presentation/hooks/useBillingVisibility";
import { useTicketGettingStartedStatus } from "@/domains/profile/presentation/hooks/useTicketGettingStartedStatus";
import {
  type CreateProjectInput,
  CreateProjectInputSchema,
} from "@/domains/project/core/usecases/project/createProject";
import { useAddUserToProject } from "@/domains/project/presentation/hooks/useAddUserToProject";
import { useCreateProject } from "@/domains/project/presentation/hooks/useCreateProject";
import { useViewer } from "@/domains/viewer/presentation/hooks/useViewer";
import CreateWorkspaceModal from "@/domains/workspace/presentation/components/CreateWorkspaceModal";
import ReclaimableProjectsSection from "@/domains/workspace/presentation/components/ReclaimableProjectsSection";
import WorkspaceEmptyState from "@/domains/workspace/presentation/components/WorkspaceEmptyState";
import WorkspaceFooter from "@/domains/workspace/presentation/components/WorkspaceFooter";
import WorkspaceHeader from "@/domains/workspace/presentation/components/WorkspaceHeader";
import WorkspaceProjectsSection from "@/domains/workspace/presentation/components/WorkspaceProjectsSection";
import { useLastActivitySubtitle } from "@/domains/workspace/presentation/hooks/useLastActivitySubtitle";
import { useProjectsWithStats } from "@/domains/workspace/presentation/hooks/useProjectsWithStats";
import { useReclaimableProjects } from "@/domains/workspace/presentation/hooks/useReclaimableProjects";

type CreateProjectFormData = CreateProjectInput;

type WorkspacePageProps = {
  referenceTimeIso?: string;
};

const WorkspacePage = ({ referenceTimeIso }: WorkspacePageProps) => {
  const router = useAppRouter();
  const { data: viewer } = useViewer();
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isFetching: isFetchingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjectsWithStats();
  const addUserToProjectMutation = useAddUserToProject();
  const createProjectMutation = useCreateProject();
  const [shouldLoadSecondaryData, setShouldLoadSecondaryData] = useState(false);
  const { data: reclaimableProjects } = useReclaimableProjects(
    shouldLoadSecondaryData
  );
  const { data: isBillingVisible } = useBillingVisibility(
    shouldLoadSecondaryData
  );
  const { legal, pricing } = useMarketingRoutes();
  const {
    canAutoOpen: canAutoOpenGettingStarted,
    isPending: isGettingStartedPending,
    error: gettingStartedError,
    markSkipped,
  } = useTicketGettingStartedStatus();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(
    PROJECT_BOARD_EMOJI_PRESETS[0]
  );
  const [reclaimingProjectId, setReclaimingProjectId] = useState<string | null>(
    null
  );
  const isSubmittingRef = useRef(false);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startTransition(() => {
        setShouldLoadSecondaryData(true);
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const tErrors = useTranslations("errors");
  const referenceTime = useMemo(() => {
    return referenceTimeIso ? new Date(referenceTimeIso) : new Date();
  }, [referenceTimeIso]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    reset: resetCreateForm,
    setValue,
    getValues,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(CreateProjectInputSchema),
    mode: "onBlur",
  });

  const openCreateModal = useCallback(() => {
    setCreateModalOpen(true);
    resetCreateForm();
    setSelectedEmoji(PROJECT_BOARD_EMOJI_PRESETS[0]);
  }, [resetCreateForm]);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  const handleReclaimProject = useCallback(
    async (projectId: string): Promise<void> => {
      setReclaimingProjectId(projectId);
      try {
        await addUserToProjectMutation.mutateAsync({ projectId });
        await refetchProjects();
      } catch {
        // Error is handled by the mutation state
      } finally {
        setReclaimingProjectId(null);
      }
    },
    [addUserToProjectMutation, refetchProjects]
  );

  useEffect(() => {
    if (createProjectMutation.error) {
      const code = getAppErrorCode(createProjectMutation.error);
      const errorMessage = getErrorMessage(
        createProjectMutation.error,
        tErrors
      );
      if (code === REPOSITORY_ERROR_CODE.CONSTRAINT_VIOLATION) {
        setFormError("name", { type: "server", message: errorMessage });
      } else {
        setFormError("root", { type: "server", message: errorMessage });
      }
    }
  }, [createProjectMutation.error, setFormError, tErrors]);

  useEffect(() => {
    if (createProjectMutation.isSuccess && createProjectMutation.data) {
      isSubmittingRef.current = false;
      closeCreateModal();
      const targetRoute = buildProjectRoute(
        createProjectMutation.data.id,
        PROJECT_VIEWS.BOARD
      );
      markNavigationStart(targetRoute, "programmatic", PAGE_ROUTES.WORKSPACE);
      router.push(targetRoute);
    }
  }, [
    createProjectMutation.isSuccess,
    createProjectMutation.data,
    router,
    closeCreateModal,
  ]);

  useEffect(() => {
    if (createProjectMutation.error) {
      isSubmittingRef.current = false;
    }
  }, [createProjectMutation.error]);

  const onCreateProjectSubmit: SubmitHandler<CreateProjectFormData> = async (
    data
  ) => {
    if (isSubmittingRef.current || createProjectMutation.isPending) {
      return;
    }
    isSubmittingRef.current = true;
    try {
      const normalizedName = stripProjectBoardEmojiPrefix(data.name).trim();
      await createProjectMutation.mutateAsync({
        name: normalizedName,
        boardEmoji: selectedEmoji,
      });
    } finally {
      submitTimerRef.current = setTimeout(() => {
        isSubmittingRef.current = false;
        submitTimerRef.current = null;
      }, 100);
    }
  };

  const handleSkipWelcomeGuide = useCallback(() => {
    markSkipped();
  }, [markSkipped]);

  const handleOpenProject = useCallback(
    (projectId: string) => {
      const targetRoute = buildProjectRoute(projectId, PROJECT_VIEWS.BOARD);
      markNavigationStart(targetRoute, "workspace-card", PAGE_ROUTES.WORKSPACE);
      router.push(targetRoute);
    },
    [router]
  );

  const formatLastActivity = useLastActivitySubtitle();

  const handleSelectEmoji = useCallback(
    (emoji: ProjectBoardEmojiPreset) => {
      setSelectedEmoji(emoji);
      const currentName = stripProjectBoardEmojiPrefix(getValues("name") ?? "");
      setValue("name", currentName, { shouldValidate: true });
    },
    [getValues, setValue]
  );

  const hasProjects = Array.isArray(projects) && projects.length > 0;
  const showProjectsListPlaceholder =
    projects === undefined &&
    shouldShowLoading({
      isLoading: isLoadingProjects,
      isFetching: isFetchingProjects,
    });
  const showWelcomeGuide = !hasProjects && canAutoOpenGettingStarted;
  const gettingStartedErrorMessage = gettingStartedError
    ? getErrorMessage(gettingStartedError, tErrors)
    : null;

  return (
    <main className={styles["workspace-page"]}>
      <WorkspaceHeader
        displayName={viewer?.displayName}
        onCreateWorkspace={openCreateModal}
      />

      <div className={styles["workspace-container"]}>
        {projectsError && (
          <ErrorMessage message={getErrorMessage(projectsError, tErrors)} />
        )}

        {Array.isArray(reclaimableProjects) &&
          reclaimableProjects.length > 0 && (
            <ReclaimableProjectsSection
              projects={reclaimableProjects}
              referenceTime={referenceTime}
              reclaimingProjectId={reclaimingProjectId}
              onReclaimProject={handleReclaimProject}
            />
          )}

        {showProjectsListPlaceholder ? (
          <section aria-busy="true">
            <Loader variant="inline" />
          </section>
        ) : shouldShowLoading({
            isLoading: isLoadingProjects,
            isPending: addUserToProjectMutation.isPending,
          }) && hasProjects ? (
          <Loader variant="inline" />
        ) : hasProjects ? (
          <WorkspaceProjectsSection
            projects={projects}
            referenceTime={referenceTime}
            formatLastActivity={formatLastActivity}
            onOpenProject={handleOpenProject}
          />
        ) : Array.isArray(projects) && projects.length === 0 ? (
          <WorkspaceEmptyState
            showWelcomeGuide={showWelcomeGuide}
            gettingStartedErrorMessage={gettingStartedErrorMessage}
            isGettingStartedPending={isGettingStartedPending}
            onCreateWorkspace={openCreateModal}
            onSkipWelcomeGuide={handleSkipWelcomeGuide}
          />
        ) : null}
      </div>

      <WorkspaceFooter
        isBillingVisible={isBillingVisible}
        legal={legal}
        pricing={pricing}
      />

      <CreateWorkspaceModal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        selectedEmoji={selectedEmoji}
        onSelectEmoji={handleSelectEmoji}
        register={register}
        handleSubmit={handleSubmit}
        onSubmit={onCreateProjectSubmit}
        errors={errors}
        isSubmitting={createProjectMutation.isPending}
      />
    </main>
  );
};

export default WorkspacePage;
