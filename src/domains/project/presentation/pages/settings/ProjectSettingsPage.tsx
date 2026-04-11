"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import {
  PROJECT_BOARD_EMOJI_PRESETS,
  stripProjectBoardEmojiPrefix,
} from "@/shared/constants/projectBoardEmoji";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import ErrorMessage from "@/shared/design-system/error_message";
import { PermissionStatusIcon } from "@/shared/design-system/icons";
import Input from "@/shared/design-system/input";
import Loader from "@/shared/design-system/loader";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import ProjectPeopleSettingsSection from "./components/ProjectPeopleSettingsSection";
import styles from "./styles.module.scss";

import { ProjectRole } from "@/domains/project/core/domain/project.types";
import { containsEmoji } from "@/domains/project/core/domain/rules/projectName.rules";
import type { UpdateProjectInput } from "@/domains/project/core/usecases/project/updateProject";
import { useDeleteProject } from "@/domains/project/presentation/hooks/useDeleteProject";
import { useProject } from "@/domains/project/presentation/hooks/useProject";
import { useUpdateProject } from "@/domains/project/presentation/hooks/useUpdateProject";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";

type ProjectSettingsPageProps = {
  projectId: string;
};

const ProjectSettingsPage = ({ projectId }: ProjectSettingsPageProps) => {
  const router = useAppRouter();
  const tPage = useTranslations("pages.settings.page");
  const tProject = useTranslations("pages.settings.project");
  const tAccess = useTranslations("pages.settings.access");
  const tDanger = useTranslations("pages.settings.dangerZone");
  const tDelete = useTranslations("pages.settings.delete");
  const tErrors = useTranslations("errors");

  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
    refetch,
  } = useProject(projectId);
  const {
    role,
    isLoading: isPermissionsLoading,
    canEditProject,
    canManageMembers,
  } = useProjectPermissions();
  const isAdmin = role === ProjectRole.ADMIN;

  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const lastProjectIdRef = useRef<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [boardEmoji, setBoardEmoji] = useState<string>(
    PROJECT_BOARD_EMOJI_PRESETS[0]
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");

  useEffect(() => {
    if (!project) {
      return;
    }

    const projectChanged = lastProjectIdRef.current !== project.id;
    const normalizedProjectName = stripProjectBoardEmojiPrefix(project.name);
    lastProjectIdRef.current = project.id;

    setProjectName((current) => {
      if (
        projectChanged ||
        current === "" ||
        current === normalizedProjectName
      ) {
        return normalizedProjectName;
      }

      return current;
    });

    setBoardEmoji((current) => {
      if (projectChanged || current === project.boardEmoji) {
        return project.boardEmoji;
      }

      return current;
    });
  }, [project]);

  const trimmedProjectName = projectName.trim();
  const isProjectLoaded = Boolean(project);
  const savedProjectName = stripProjectBoardEmojiPrefix(project?.name ?? "");
  const savedBoardEmoji = project?.boardEmoji ?? PROJECT_BOARD_EMOJI_PRESETS[0];
  const nameContainsEmoji = containsEmoji(trimmedProjectName);
  const isDirty =
    project != null &&
    (trimmedProjectName !== savedProjectName || boardEmoji !== savedBoardEmoji);
  const isProjectNameInvalid =
    trimmedProjectName.length === 0 || nameContainsEmoji;
  const isSaveDisabled =
    !canEditProject ||
    !isProjectLoaded ||
    isProjectNameInvalid ||
    !isDirty ||
    updateProjectMutation.isPending;
  const isDeleteConfirmationValid =
    project != null && deleteConfirmationName.trim() === savedProjectName;
  const roleLabel =
    role != null ? tAccess(`roles.${role}`) : tAccess("fallbackRole");
  const permissionRows = [
    {
      label: tAccess("capabilities.projectEdit"),
      isAllowed: canEditProject,
    },
    {
      label: tAccess("capabilities.invitation"),
      isAllowed: canManageMembers,
    },
    {
      label: tAccess("capabilities.roleManagement"),
      isAllowed: canManageMembers,
    },
  ];
  const createdAtLabel = project
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        project.createdAt
      )
    : "";

  const projectErrorMessage = projectError
    ? getErrorMessage(projectError, tErrors)
    : null;
  const updateErrorMessage = updateProjectMutation.error
    ? getErrorMessage(updateProjectMutation.error, tErrors)
    : null;
  const deleteErrorMessage = deleteProjectMutation.error
    ? getErrorMessage(deleteProjectMutation.error, tErrors)
    : null;

  const handleProjectNameChange = (value: string) => {
    if (updateProjectMutation.isSuccess || updateProjectMutation.error) {
      updateProjectMutation.reset();
    }

    setProjectName(stripProjectBoardEmojiPrefix(value));
  };

  const handleBoardEmojiChange = (value: string) => {
    if (updateProjectMutation.isSuccess || updateProjectMutation.error) {
      updateProjectMutation.reset();
    }

    setBoardEmoji(value);
  };

  const handleProjectSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaveDisabled || project == null) {
      return;
    }

    const input: UpdateProjectInput = {};

    if (trimmedProjectName !== savedProjectName) {
      input.name = trimmedProjectName;
    }

    if (boardEmoji !== savedBoardEmoji) {
      input.boardEmoji = boardEmoji;
    }

    if (Object.keys(input).length === 0) {
      return;
    }

    try {
      await updateProjectMutation.mutateAsync({
        projectId: project.id,
        input,
      });
    } catch {
      // Error state is rendered in the form.
    }
  };

  const handleProjectReset = () => {
    if (!project) {
      return;
    }

    updateProjectMutation.reset();
    setProjectName(savedProjectName);
    setBoardEmoji(savedBoardEmoji);
  };

  const openDeleteModal = () => {
    deleteProjectMutation.reset();
    setDeleteConfirmationName("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    deleteProjectMutation.reset();
    setDeleteConfirmationName("");
    setIsDeleteModalOpen(false);
  };

  const handleDeleteProject = async () => {
    if (!project || !isAdmin || !isDeleteConfirmationValid) {
      return;
    }

    try {
      await deleteProjectMutation.mutateAsync(project.id);
      router.replace(PAGE_ROUTES.WORKSPACE);
    } catch {
      // Error state is rendered in the modal.
    }
  };

  if (isProjectLoading || isPermissionsLoading) {
    return (
      <Loader
        variant="inline"
        size="large"
        message={tPage("loading")}
        ariaLabel={tPage("loading")}
      />
    );
  }

  if (!project) {
    return (
      <section className={styles["settings-page"]}>
        <ErrorMessage
          title={tPage("loadErrorTitle")}
          message={projectErrorMessage ?? tErrors("generic")}
        />

        <div className={styles["settings-page__retry"]}>
          <Button label={tPage("retry")} onClick={() => void refetch()} />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={styles["settings-page"]}>
        <div className={styles["settings-page__grid"]}>
          <Card className={styles["settings-page__card"]}>
            <div className={styles["settings-page__section-header"]}>
              <Title
                variant="h2"
                className={styles["settings-page__section-title"]}
              >
                {tProject("title")}
              </Title>
              <Text
                variant="caption"
                className={styles["settings-page__section-subtitle"]}
              >
                {tProject("subtitle")}
              </Text>
            </div>

            <form
              className={styles["settings-page__form"]}
              onSubmit={(event) => void handleProjectSave(event)}
            >
              <div className={styles["settings-page__emoji-field"]}>
                <Text
                  variant="caption"
                  className={styles["settings-page__emoji-label"]}
                  id={getAccessibilityId("settings-project-board-emoji-label")}
                >
                  {tProject("fields.boardEmoji.label")}
                </Text>
                <div
                  className={styles["settings-page__emoji-grid"]}
                  role="group"
                  aria-labelledby={getAccessibilityId(
                    "settings-project-board-emoji-label"
                  )}
                >
                  {PROJECT_BOARD_EMOJI_PRESETS.map((emoji, index) => {
                    const isSelected = boardEmoji === emoji;

                    return (
                      <button
                        key={emoji}
                        type="button"
                        className={`${styles["settings-page__emoji-option"]} ${
                          isSelected
                            ? styles["settings-page__emoji-option--selected"]
                            : ""
                        }`}
                        aria-label={`${tProject("fields.boardEmoji.choiceAriaLabel")} ${emoji}`}
                        aria-pressed={isSelected}
                        disabled={
                          !canEditProject || updateProjectMutation.isPending
                        }
                        onClick={() => {
                          handleBoardEmojiChange(emoji);
                        }}
                        id={getAccessibilityId(
                          `settings-project-board-emoji-${index}`
                        )}
                      >
                        <span aria-hidden="true">{emoji}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles["settings-page__name-field"]}>
                <Input
                  id="settings-project-name-input"
                  label={tProject("fields.projectName.label")}
                  placeholder={tProject("fields.projectName.placeholder")}
                  value={projectName}
                  onChange={(event) =>
                    handleProjectNameChange(event.target.value)
                  }
                  disabled={!canEditProject || updateProjectMutation.isPending}
                  error={
                    trimmedProjectName.length === 0
                      ? tProject("validation.projectNameRequired")
                      : nameContainsEmoji
                        ? tProject("validation.projectNameContainsEmoji")
                        : undefined
                  }
                />
              </div>

              <div className={styles["settings-page__meta-list"]}>
                <div className={styles["settings-page__meta-row"]}>
                  <Text
                    variant="caption"
                    className={styles["settings-page__meta-label"]}
                  >
                    {tProject("fields.shortCode.label")}
                  </Text>
                  <Text
                    variant="body"
                    className={styles["settings-page__meta-value"]}
                  >
                    {project.shortCode}
                  </Text>
                </div>
                <div className={styles["settings-page__meta-row"]}>
                  <Text
                    variant="caption"
                    className={styles["settings-page__meta-label"]}
                  >
                    {tProject("fields.createdAt.label")}
                  </Text>
                  <Text
                    variant="body"
                    className={styles["settings-page__meta-value"]}
                  >
                    {createdAtLabel}
                  </Text>
                </div>
              </div>

              {updateErrorMessage && (
                <ErrorMessage message={updateErrorMessage} />
              )}

              {updateProjectMutation.isSuccess && !isDirty && (
                <Text
                  variant="small"
                  className={styles["settings-page__status"]}
                >
                  {tProject("status.saved")}
                </Text>
              )}

              {isDirty && (
                <div className={styles["settings-page__actions"]}>
                  <Button
                    label={tProject("actions.reset")}
                    variant="secondary"
                    type="button"
                    onClick={handleProjectReset}
                    disabled={updateProjectMutation.isPending}
                  />
                  <Button
                    label={
                      updateProjectMutation.isPending
                        ? tProject("actions.saving")
                        : tProject("actions.save")
                    }
                    type="submit"
                    disabled={isSaveDisabled}
                  />
                </div>
              )}
            </form>
          </Card>

          <Card className={styles["settings-page__card"]}>
            <div className={styles["settings-page__section-header"]}>
              <Title
                variant="h2"
                className={styles["settings-page__section-title"]}
              >
                {tAccess("title")}
              </Title>
              <Text
                variant="caption"
                className={styles["settings-page__section-subtitle"]}
              >
                {tAccess("subtitle")}
              </Text>
            </div>

            <div className={styles["settings-page__meta-list"]}>
              <div className={styles["settings-page__meta-row"]}>
                <Text
                  variant="caption"
                  className={styles["settings-page__meta-label"]}
                >
                  {tAccess("currentRoleLabel")}
                </Text>
                <Text
                  variant="body"
                  className={styles["settings-page__meta-value"]}
                >
                  {roleLabel}
                </Text>
              </div>
              {permissionRows.map((permission) => (
                <div
                  key={permission.label}
                  className={styles["settings-page__meta-row"]}
                >
                  <Text
                    variant="caption"
                    className={styles["settings-page__meta-label"]}
                  >
                    {permission.label}
                  </Text>
                  <span
                    className={`${styles["settings-page__permission-badge"]} ${
                      permission.isAllowed
                        ? styles["settings-page__permission-badge--allowed"]
                        : styles["settings-page__permission-badge--blocked"]
                    }`}
                  >
                    <PermissionStatusIcon isAllowed={permission.isAllowed} />
                    <span className="visually-hidden">
                      {permission.isAllowed
                        ? tAccess("statuses.allowed")
                        : tAccess("statuses.blocked")}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <ProjectPeopleSettingsSection projectId={project.id} />

        {isAdmin && (
          <>
            <Card
              className={`${styles["settings-page__card"]} ${styles["settings-page__card--danger"]}`}
            >
              <div className={styles["settings-page__danger-body"]}>
                <div className={styles["settings-page__danger-content"]}>
                  <Title
                    variant="h2"
                    className={styles["settings-page__danger-title"]}
                  >
                    {tDanger("title")}
                  </Title>
                  <Text
                    variant="small"
                    className={styles["settings-page__danger-copy"]}
                  >
                    {tDanger("description")}
                  </Text>
                </div>

                <div className={styles["settings-page__danger-side"]}>
                  <Button
                    label={tDelete("open")}
                    variant="danger"
                    onClick={openDeleteModal}
                    aria-label={tDelete("openAriaLabel")}
                  />
                </div>
              </div>
            </Card>

            <Modal
              isOpen={isDeleteModalOpen}
              onClose={closeDeleteModal}
              title={tDelete("modalTitle")}
              size="medium"
            >
              <Text className={styles["settings-page__confirmation-copy"]}>
                {tDelete("modalDescription")}
              </Text>

              <Input
                label={tDelete("confirmationLabel")}
                placeholder={tDelete("confirmationPlaceholder", {
                  name: savedProjectName,
                })}
                value={deleteConfirmationName}
                onChange={(event) =>
                  setDeleteConfirmationName(event.target.value)
                }
                helperText={tDelete("confirmationHelper", {
                  name: savedProjectName,
                })}
                disabled={deleteProjectMutation.isPending}
              />

              {deleteErrorMessage && (
                <ErrorMessage message={deleteErrorMessage} />
              )}

              <div className={styles["settings-page__modal-actions"]}>
                <Button
                  label={tDelete("cancel")}
                  variant="secondary"
                  onClick={closeDeleteModal}
                  disabled={deleteProjectMutation.isPending}
                />
                <Button
                  label={
                    deleteProjectMutation.isPending
                      ? tDelete("deleting")
                      : tDelete("confirm")
                  }
                  variant="danger"
                  onClick={() => void handleDeleteProject()}
                  disabled={
                    !isDeleteConfirmationValid ||
                    deleteProjectMutation.isPending
                  }
                />
              </div>
            </Modal>
          </>
        )}
      </section>
    </>
  );
};

export default ProjectSettingsPage;
