"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { CreateProjectInput } from "@/core/domain/schema/project.schema";
import type { ProjectWithRole } from "@/core/domain/schema/project.schema";
import { CreateProjectInputSchema } from "@/core/domain/schema/project.schema";

import {
  Badge,
  Button,
  ErrorMessage,
  Form,
  Input,
  Link,
  Loader,
  Modal,
  Text,
} from "@/presentation/components/ui";
import {
  useAddUserToProject,
  useCreateProject,
  useProjects,
  useSession,
} from "@/presentation/hooks";

import { getAccessibilityId } from "@/shared/a11y";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { shouldShowLoading } from "@/shared/utils";
import { buildProjectRoute } from "@/shared/utils/routes";

import styles from "./styles.module.scss";

type CreateProjectFormData = CreateProjectInput;

const getRoleLabelKey = (
  role: ProjectWithRole["role"]
): "roleAdmin" | "roleMember" | "roleViewer" => {
  switch (role) {
    case "admin":
      return "roleAdmin";
    case "member":
      return "roleMember";
    case "viewer":
      return "roleViewer";
    default:
      return "roleMember";
  }
};

/** Emoji per workspace card (simple mapping by index). */
const getWorkspaceEmoji = (index: number): string => {
  const emojis = ["🎨", "🛍️", "📸", "✨", "🌸", "💡", "📝", "🎯"];
  return emojis[index % emojis.length];
};

// TODO: Replace with real member count from API when available
const getProjectMemberCount = (_project: ProjectWithRole): number => {
  return 1;
};

// TODO: Replace with real task count from API when available
const getProjectTaskCount = (_project: ProjectWithRole): number => {
  return 0;
};

// TODO: Replace with real "in progress" count from API when available
const getProjectStatInProgress = (_project: ProjectWithRole): number => {
  return 0;
};

// TODO: Replace with real "completed" count from API when available
const getProjectStatCompleted = (_project: ProjectWithRole): number => {
  return 0;
};

const WorkspacePage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isFetching: isFetchingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects();
  const addUserToProjectMutation = useAddUserToProject();
  const createProjectMutation = useCreateProject();
  const [joinProjectId, setJoinProjectId] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const isSubmittingRef = useRef(false);
  const t = useTranslation("pages.workspace");
  const tErrors = useTranslation("errors");

  const displayName = session?.email ?? t("userFallbackName");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    reset: resetCreateForm,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(CreateProjectInputSchema),
    mode: "onBlur",
  });

  const openCreateModal = useCallback(() => {
    setCreateModalOpen(true);
    resetCreateForm();
  }, [resetCreateForm]);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  const openJoinModal = useCallback(() => {
    setJoinModalOpen(true);
    setJoinProjectId("");
    setJoinError(null);
  }, []);

  const closeJoinModal = useCallback(() => {
    setJoinModalOpen(false);
  }, []);

  const handleJoinWorkspace = async (): Promise<void> => {
    const trimmed = joinProjectId.trim();
    if (!trimmed) {
      setJoinError(t("pleaseEnterProjectId"));
      return;
    }
    setJoinError(null);
    try {
      await addUserToProjectMutation.mutateAsync({ projectId: trimmed });
      setJoinProjectId("");
      await refetchProjects();
      closeJoinModal();
    } catch (err) {
      const error = err as { code?: string };
      setJoinError(getErrorMessage(error, tErrors));
    }
  };

  useEffect(() => {
    if (createProjectMutation.error) {
      const error = createProjectMutation.error as { code?: string };
      const errorMessage = getErrorMessage(error, tErrors);
      if (error.code === "CONSTRAINT_VIOLATION") {
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
      router.push(
        buildProjectRoute(createProjectMutation.data.id, PROJECT_VIEWS.BOARD)
      );
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
      await createProjectMutation.mutateAsync(data);
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 100);
    }
  };

  const showInitialLoader =
    shouldShowLoading({
      isLoading: isLoadingProjects,
      isFetching: isFetchingProjects,
    }) && projects === undefined;

  if (showInitialLoader) {
    return (
      <main className={styles["workspace-page"]}>
        <Loader variant="full-page" />
      </main>
    );
  }

  const hasProjects = Array.isArray(projects) && projects.length > 0;

  return (
    <main className={styles["workspace-page"]}>
      <header className={styles["workspace-header"]}>
        <div className={styles["workspace-header__content"]}>
          <div className={styles["workspace-welcome"]}>
            <div className={styles["workspace-welcome__label"]}>
              {t("welcomeLabel")}
            </div>
            <h1 className={styles["workspace-welcome__title"]}>
              {t("welcomeBanner", { name: displayName })}
            </h1>
            <p className={styles["workspace-welcome__subtitle"]}>
              {t("welcomeSubtitle")}
            </p>
          </div>
          <div className={styles["workspace-header__actions"]}>
            <Button
              label={t("addWorkspaceButton")}
              onClick={openCreateModal}
              aria-label={t("addWorkspaceButtonAriaLabel")}
            />
            <Button
              label={t("joinWorkspaceButton")}
              onClick={openJoinModal}
              variant="secondary"
              aria-label={t("joinWorkspaceButtonAriaLabel")}
            />
          </div>
        </div>
      </header>

      <div className={styles["workspace-container"]}>
        {projectsError && (
          <ErrorMessage
            message={getErrorMessage(
              projectsError as { code?: string },
              tErrors
            )}
          />
        )}

        {shouldShowLoading({
          isLoading: isLoadingProjects,
          isPending: addUserToProjectMutation.isPending,
        }) && hasProjects ? (
          <Loader variant="inline" />
        ) : hasProjects ? (
          <section
            className={styles["workspace-main"]}
            aria-labelledby={getAccessibilityId("workspace-main-title")}
          >
            <div className={styles["section-header"]}>
              <h2
                id={getAccessibilityId("workspace-main-title")}
                className={styles["section-title"]}
              >
                {t("yourWorkspacesTitle")}
              </h2>
              <p className={styles["section-description"]}>
                {t("sectionDescription")}
              </p>
            </div>

            <div className={styles["workspaces-grid"]}>
              {projects.map((project, index) => {
                const roleKey = getRoleLabelKey(project.role);
                const roleLabel = t(roleKey);
                const openAriaLabel = t("openWorkspaceAriaLabel", {
                  name: project.name,
                  role: roleLabel,
                });
                const memberCount = getProjectMemberCount(project);
                const taskCount = getProjectTaskCount(project);
                const statInProgress = getProjectStatInProgress(project);
                const statCompleted = getProjectStatCompleted(project);

                return (
                  <div
                    key={project.id}
                    className={styles["workspace-card"]}
                    onClick={() =>
                      router.push(
                        buildProjectRoute(project.id, PROJECT_VIEWS.BOARD)
                      )
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={openAriaLabel}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(
                          buildProjectRoute(project.id, PROJECT_VIEWS.BOARD)
                        );
                      }
                    }}
                  >
                    <div className={styles["workspace-card__header"]}>
                      <div className={styles["workspace-icon"]}>
                        {getWorkspaceEmoji(index)}
                      </div>
                    </div>
                    <h3 className={styles["workspace-name"]}>{project.name}</h3>
                    <div className={styles["workspace-meta"]}>
                      <span className={styles["workspace-meta-item"]}>
                        <span aria-hidden="true">👥</span>
                        <span>{t("membersCount", { count: memberCount })}</span>
                      </span>
                      <span className={styles["workspace-meta-item"]}>
                        <span aria-hidden="true">📋</span>
                        <span>{t("tasksCount", { count: taskCount })}</span>
                      </span>
                    </div>
                    <Badge
                      label={roleLabel}
                      size="small"
                      ariaLabel={`${t("roleAriaLabel")}: ${roleLabel}`}
                      className={styles["workspace-badge"]}
                    />
                    <div className={styles["workspace-stats"]}>
                      <div className={styles["stat"]}>
                        <span className={styles["stat-value"]}>
                          {statInProgress}
                        </span>
                        <span className={styles["stat-label"]}>
                          {t("statInProgress")}
                        </span>
                      </div>
                      <div className={styles["stat"]}>
                        <span className={styles["stat-value"]}>
                          {statCompleted}
                        </span>
                        <span className={styles["stat-label"]}>
                          {t("statCompleted")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : Array.isArray(projects) && projects.length === 0 ? (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-state-icon"]} aria-hidden="true">
              ✨
            </div>
            <h2 className={styles["empty-state-title"]}>
              {t("emptyStateCardTitle")}
            </h2>
            <p className={styles["empty-state-description"]}>
              {t("emptyStateCardDescription")}
            </p>
            <Button
              label={t("addFirstProjectButton")}
              onClick={openCreateModal}
              aria-label={t("addFirstProjectButtonAriaLabel")}
            />
          </div>
        ) : null}
      </div>

      <footer
        className={styles["workspace-footer"]}
        aria-label={t("footer.ariaLabel")}
      >
        <nav className={styles["workspace-footer__nav"]}>
          <Link
            href="#"
            className={styles["workspace-footer__link"]}
            ariaLabel={t("footer.account")}
          >
            {t("footer.account")}
          </Link>
          <Link
            href="#"
            className={styles["workspace-footer__link"]}
            ariaLabel={t("footer.legal")}
          >
            {t("footer.legal")}
          </Link>
          <Link
            href="#"
            className={styles["workspace-footer__link"]}
            ariaLabel={t("footer.subscriptions")}
          >
            {t("footer.subscriptions")}
          </Link>
        </nav>
      </footer>

      <Modal
        isOpen={createModalOpen}
        onClose={closeCreateModal}
        title={t("createWorkspaceTitle")}
        size="medium"
      >
        <Text variant="small" className={styles["workspace-modal-description"]}>
          {t("createWorkspaceDescription")}
        </Text>
        <Form
          onSubmit={handleSubmit(onCreateProjectSubmit)}
          className={styles["workspace-modal-form"]}
          error={errors.root?.message}
          noValidate
        >
          <Input
            label={t("projectNameLabel")}
            type="text"
            autoComplete="off"
            required
            error={errors.name?.message}
            placeholder={t("projectNamePlaceholder")}
            {...register("name")}
          />
          <Button
            label={t("createButton")}
            type="submit"
            fullWidth
            disabled={createProjectMutation.isPending}
            aria-label={t("createButtonAriaLabel")}
          />
        </Form>
      </Modal>

      <Modal
        isOpen={joinModalOpen}
        onClose={closeJoinModal}
        title={t("joinWorkspaceTitle")}
        size="medium"
      >
        <Text variant="small" className={styles["workspace-modal-description"]}>
          {t("joinWorkspaceDescription")}
        </Text>
        <div className={styles["workspace-modal-form"]}>
          <Input
            label={t("projectIdLabel")}
            type="text"
            value={joinProjectId}
            onChange={(e) => {
              setJoinProjectId(e.target.value);
              setJoinError(null);
            }}
            error={joinError ?? undefined}
            placeholder={t("projectIdPlaceholder")}
          />
          <Button
            label={t("joinButton")}
            onClick={handleJoinWorkspace}
            disabled={
              !joinProjectId.trim() || addUserToProjectMutation.isPending
            }
            variant="secondary"
            aria-label={t("joinButtonAriaLabel")}
          />
        </div>
      </Modal>
    </main>
  );
};

export default WorkspacePage;
