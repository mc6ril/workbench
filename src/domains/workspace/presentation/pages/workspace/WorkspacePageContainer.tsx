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
import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  PROJECT_BOARD_EMOJI_PRESETS,
  type ProjectBoardEmojiPreset,
  stripProjectBoardEmojiPrefix,
} from "@/shared/constants/projectBoardEmoji";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { getAppErrorCode } from "@/shared/errors/appError";
import { REPOSITORY_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { useTranslations } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { useMarketingRoutes } from "@/shared/i18n/useMarketingRoutes";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { shouldShowLoading } from "@/shared/utils/queryStatus";
import { buildProjectRoute } from "@/shared/utils/routes";

import {
  useWorkspaceRouteDisplayName,
  useWorkspaceRouteReferenceTimeIso,
} from "./WorkspacePageRouteContext";
import WorkspacePageView from "./WorkspacePageView";

import {
  type CreateProjectInput,
  CreateProjectInputSchema,
} from "@/domains/project/core/usecases/project/createProject";
import { useAddUserToProject } from "@/domains/project/presentation/hooks/useAddUserToProject";
import { useCreateProject } from "@/domains/project/presentation/hooks/useCreateProject";
import { useLastActivitySubtitle } from "@/domains/workspace/presentation/hooks/useLastActivitySubtitle";
import { useProjectsWithStats } from "@/domains/workspace/presentation/hooks/useProjectsWithStats";
import { useReclaimableProjects } from "@/domains/workspace/presentation/hooks/useReclaimableProjects";

type CreateProjectFormData = CreateProjectInput;

const CreateWorkspaceModal = dynamic(
  () =>
    import("@/domains/workspace/presentation/components/CreateWorkspaceModal"),
  {
    loading: () => null,
  }
);

const WorkspacePageContainer = () => {
  const router = useAppRouter();
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
  const { legal } = useMarketingRoutes();
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
  const displayName = useWorkspaceRouteDisplayName();
  const referenceTimeIso = useWorkspaceRouteReferenceTimeIso();
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

  const handleOpenProject = useCallback(
    (projectId: string) => {
      const targetRoute = buildProjectRoute(projectId, PROJECT_VIEWS.BOARD);
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
  const showProjectsRefreshLoader =
    shouldShowLoading({
      isLoading: isLoadingProjects,
      isPending: addUserToProjectMutation.isPending,
    }) && hasProjects;
  const projectsErrorMessage = projectsError
    ? getErrorMessage(projectsError, tErrors)
    : null;

  return (
    <WorkspacePageView
      displayName={displayName}
      onCreateWorkspace={openCreateModal}
      legal={legal}
      projects={projects}
      projectsErrorMessage={projectsErrorMessage}
      reclaimableProjects={reclaimableProjects}
      referenceTime={referenceTime}
      reclaimingProjectId={reclaimingProjectId}
      onReclaimProject={handleReclaimProject}
      showProjectsListPlaceholder={showProjectsListPlaceholder}
      showProjectsRefreshLoader={showProjectsRefreshLoader}
      onOpenProject={handleOpenProject}
      formatLastActivity={formatLastActivity}
      createWorkspaceModal={
        createModalOpen ? (
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
        ) : null
      }
    />
  );
};

export default WorkspacePageContainer;
