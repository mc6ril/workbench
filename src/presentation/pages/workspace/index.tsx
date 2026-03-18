"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { CreateProjectInput } from "@/domains/project-management/core/domain/schema/project.schema";
import { CreateProjectInputSchema } from "@/domains/project-management/core/domain/schema/project.schema";
import { ProjectRole } from "@/domains/project-management/core/domain/schema/project.schema";
import { SubscriptionPlan } from "@/domains/project-management/core/domain/schema/subscription.schema";

import { useSession } from "@/presentation/hooks/auth/useSession";
import { useAddUserToProject } from "@/presentation/hooks/project/useAddUserToProject";
import { useCreateProject } from "@/presentation/hooks/project/useCreateProject";
import { useLastActivitySubtitle } from "@/presentation/hooks/project/useLastActivitySubtitle";
import { useProjectsWithStats } from "@/presentation/hooks/project/useProjectsWithStats";
import { useReclaimableProjects } from "@/presentation/hooks/project/useReclaimableProjects";
import { useSubscription } from "@/presentation/hooks/subscription/useSubscription";
import { shouldShowLoading } from "@/presentation/utils/queryStatus";

import { getAccessibilityId } from "@/shared/a11y";
import { PAGE_ROUTES, PROJECT_VIEWS } from "@/shared/constants/routes";
import Badge from "@/shared/design-system/Badge";
import Button from "@/shared/design-system/Button";
import ErrorMessage from "@/shared/design-system/ErrorMessage";
import Form from "@/shared/design-system/Form";
import Input from "@/shared/design-system/Input";
import Link from "@/shared/design-system/Link";
import Loader from "@/shared/design-system/Loader";
import Modal from "@/shared/design-system/Modal";
import Text from "@/shared/design-system/Text";
import { getRoleLabelKey, useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { markNavigationStart } from "@/shared/observability";
import { getWorkspaceEmoji } from "@/shared/utils";
import { buildProjectRoute } from "@/shared/utils/routes";

import ProjectCardActions from "./components/ProjectCardActions";
import styles from "./styles.module.scss";

type CreateProjectFormData = CreateProjectInput;

const WORKSPACE_EMOJI_OPTIONS = Object.freeze([
  "🏡",
  "🏠",
  "👨‍👩‍👧‍👦",
  "❤️",
  "🧺",
  "🛒",
  "📆",
  "🌿",
]);

const stripWorkspaceEmojiPrefix = (value: string): string => {
  const trimmed = value.trim();
  for (const emoji of WORKSPACE_EMOJI_OPTIONS) {
    if (trimmed.startsWith(`${emoji} `)) {
      return trimmed.slice(emoji.length + 1).trim();
    }
  }
  return trimmed;
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
  } = useProjectsWithStats(!!session);
  const addUserToProjectMutation = useAddUserToProject();
  const createProjectMutation = useCreateProject();
  const { data: reclaimableProjects } = useReclaimableProjects(!!session);
  const { data: subscription, isLoading: isSubscriptionLoading } =
    useSubscription();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(
    WORKSPACE_EMOJI_OPTIONS[0]
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
  const t = useTranslation("pages.workspace");
  const tReclaim = useTranslation("pages.workspace.reclaimable");
  const tErrors = useTranslation("errors");

  const displayName = session?.displayName ?? t("userFallbackName");

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
    setSelectedEmoji(WORKSPACE_EMOJI_OPTIONS[0]);
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
      const normalizedName = stripWorkspaceEmojiPrefix(data.name);
      const prefixedName = `${selectedEmoji} ${normalizedName}`.trim();
      await createProjectMutation.mutateAsync({
        ...data,
        name: prefixedName,
      });
    } finally {
      submitTimerRef.current = setTimeout(() => {
        isSubmittingRef.current = false;
        submitTimerRef.current = null;
      }, 100);
    }
  };

  const formatLastActivity = useLastActivitySubtitle();

  const selectedEmojiIndex = useMemo(() => {
    return WORKSPACE_EMOJI_OPTIONS.findIndex(
      (emoji) => emoji === selectedEmoji
    );
  }, [selectedEmoji]);

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

        {Array.isArray(reclaimableProjects) &&
          reclaimableProjects.length > 0 && (
            <section
              className={styles["reclaimable-section"]}
              aria-label={tReclaim("sectionTitle")}
            >
              <div className={styles["reclaimable-banner"]}>
                <div className={styles["reclaimable-header"]}>
                  <h2 className={styles["reclaimable-title"]}>
                    <span aria-hidden="true">📦</span>
                    {tReclaim("sectionTitle")}
                  </h2>
                  <p className={styles["reclaimable-description"]}>
                    {tReclaim("sectionDescription")}
                  </p>
                </div>
                <div className={styles["reclaimable-list"]}>
                  {reclaimableProjects.map((project) => {
                    const daysRemaining = Math.max(
                      0,
                      30 -
                        Math.floor(
                          (Date.now() - project.orphanedAt.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                    );
                    const orphanedDate =
                      project.orphanedAt.toLocaleDateString();

                    return (
                      <div
                        key={project.id}
                        className={styles["reclaimable-card"]}
                      >
                        <div className={styles["reclaimable-card__info"]}>
                          <div className={styles["reclaimable-card__name"]}>
                            {project.name}
                          </div>
                          <div className={styles["reclaimable-card__meta"]}>
                            <span>
                              {tReclaim("orphanedSince", {
                                date: orphanedDate,
                              })}
                            </span>
                            <span>
                              {tReclaim("expiresIn", {
                                days: daysRemaining,
                              })}
                            </span>
                          </div>
                        </div>
                        <Button
                          label={tReclaim("reclaimButton")}
                          onClick={() => handleReclaimProject(project.id)}
                          disabled={reclaimingProjectId === project.id}
                          variant="secondary"
                          aria-label={tReclaim("reclaimButtonAriaLabel", {
                            name: project.name,
                          })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
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

                return (
                  <div
                    key={project.id}
                    className={styles["workspace-card"]}
                    onClick={() => {
                      const targetRoute = buildProjectRoute(
                        project.id,
                        PROJECT_VIEWS.BOARD
                      );
                      markNavigationStart(
                        targetRoute,
                        "workspace-card",
                        PAGE_ROUTES.WORKSPACE
                      );
                      router.push(targetRoute);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={openAriaLabel}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        const targetRoute = buildProjectRoute(
                          project.id,
                          PROJECT_VIEWS.BOARD
                        );
                        markNavigationStart(
                          targetRoute,
                          "workspace-card",
                          PAGE_ROUTES.WORKSPACE
                        );
                        router.push(targetRoute);
                      }
                    }}
                  >
                    <div className={styles["workspace-card__header"]}>
                      <div className={styles["workspace-icon"]}>
                        {getWorkspaceEmoji(index)}
                      </div>
                      {project.role === ProjectRole.ADMIN && (
                        <ProjectCardActions
                          projectId={project.id}
                          projectName={project.name}
                          currentPlan={
                            subscription?.plan ?? SubscriptionPlan.FREE
                          }
                          isSubscriptionLoading={isSubscriptionLoading}
                        />
                      )}
                    </div>
                    <h3 className={styles["workspace-name"]}>{project.name}</h3>
                    <p className={styles["workspace-last-activity"]}>
                      {formatLastActivity(project.updatedAt)}
                    </p>
                    <div className={styles["workspace-meta"]}>
                      <span className={styles["workspace-meta-item"]}>
                        <span aria-hidden="true">👥</span>
                        <span>
                          {t("membersCount", { count: project.memberCount })}
                        </span>
                      </span>
                      <span className={styles["workspace-meta-item"]}>
                        <span aria-hidden="true">📋</span>
                        <span>
                          {t("tasksCount", { count: project.ticketCount })}
                        </span>
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
                          {project.inProgressCount}
                        </span>
                        <span className={styles["stat-label"]}>
                          {t("statInProgress")}
                        </span>
                      </div>
                      <div className={styles["stat"]}>
                        <span className={styles["stat-value"]}>
                          {project.completedCount}
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
            href={PAGE_ROUTES.ACCOUNT}
            className={styles["workspace-footer__link"]}
            ariaLabel={t("footer.account")}
          >
            {t("footer.account")}
          </Link>
          <Link
            href={PAGE_ROUTES.LEGAL}
            className={styles["workspace-footer__link"]}
            ariaLabel={t("footer.legal")}
          >
            {t("footer.legal")}
          </Link>
          <Link
            href={PAGE_ROUTES.PRICING}
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
        <div
          className={styles["workspace-emoji-picker"]}
          role="group"
          aria-label={t("emojiPickerAriaLabel")}
        >
          <Text
            variant="small"
            className={styles["workspace-emoji-picker__label"]}
          >
            {t("emojiPickerLabel")}
          </Text>
          <div className={styles["workspace-emoji-picker__list"]}>
            {WORKSPACE_EMOJI_OPTIONS.map((emoji, index) => (
              <button
                key={emoji}
                type="button"
                className={
                  index === selectedEmojiIndex
                    ? `${styles["workspace-emoji-option"]} ${styles["workspace-emoji-option--selected"]}`
                    : styles["workspace-emoji-option"]
                }
                aria-label={t("emojiPickerOptionAriaLabel", { emoji })}
                onClick={() => {
                  setSelectedEmoji(emoji);
                  const currentName = stripWorkspaceEmojiPrefix(
                    getValues("name") ?? ""
                  );
                  setValue("name", currentName, { shouldValidate: true });
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
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
    </main>
  );
};

export default WorkspacePage;
