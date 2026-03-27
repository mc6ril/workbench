"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import ErrorMessage from "@/shared/design-system/error_message";
import Input from "@/shared/design-system/input";
import Loader from "@/shared/design-system/loader";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import ProjectPeopleSettingsSection from "./components/ProjectPeopleSettingsSection";
import styles from "./styles.module.scss";

import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import { useDeleteProject } from "@/domains/project/presentation/hooks/useDeleteProject";
import { useProject } from "@/domains/project/presentation/hooks/useProject";
import { useUpdateProject } from "@/domains/project/presentation/hooks/useUpdateProject";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions";

type ProjectSettingsPageProps = {
  projectId: string;
};

const ProjectSettingsPage = ({ projectId }: ProjectSettingsPageProps) => {
  const router = useRouter();
  const tPage = useTranslation("pages.settings.page");
  const tProject = useTranslation("pages.settings.project");
  const tAccess = useTranslation("pages.settings.access");
  const tDanger = useTranslation("pages.settings.dangerZone");
  const tDelete = useTranslation("pages.settings.delete");
  const tErrors = useTranslation("errors");

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
    canDeleteProject,
  } = useProjectPermissions();

  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const lastProjectIdRef = useRef<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");

  useEffect(() => {
    if (!project) {
      return;
    }

    const projectChanged = lastProjectIdRef.current !== project.id;
    lastProjectIdRef.current = project.id;

    setProjectName((current) => {
      if (projectChanged || current === "" || current === project.name) {
        return project.name;
      }

      return current;
    });
  }, [project]);

  const trimmedProjectName = projectName.trim();
  const isProjectLoaded = Boolean(project);
  const savedProjectName = project?.name ?? "";
  const isDirty = project != null && trimmedProjectName !== savedProjectName;
  const isProjectNameInvalid = trimmedProjectName.length === 0;
  const isSaveDisabled =
    !canEditProject ||
    !isProjectLoaded ||
    isProjectNameInvalid ||
    !isDirty ||
    updateProjectMutation.isPending;
  const isDeleteConfirmationValid =
    project != null && deleteConfirmationName.trim() === project.name;
  const roleLabel =
    role != null
      ? tAccess(`roles.${role}`)
      : tAccess("fallbackRole");
  const createdAtLabel = project
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        project.createdAt
      )
    : "";

  const projectErrorMessage = projectError
    ? getErrorMessage(projectError as { code?: string }, tErrors)
    : null;
  const updateErrorMessage = updateProjectMutation.error
    ? getErrorMessage(
        updateProjectMutation.error as { code?: string },
        tErrors
      )
    : null;
  const deleteErrorMessage = deleteProjectMutation.error
    ? getErrorMessage(
        deleteProjectMutation.error as { code?: string },
        tErrors
      )
    : null;

  const handleProjectNameChange = (value: string) => {
    if (updateProjectMutation.isSuccess || updateProjectMutation.error) {
      updateProjectMutation.reset();
    }

    setProjectName(value);
  };

  const handleProjectSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaveDisabled || project == null) {
      return;
    }

    try {
      await updateProjectMutation.mutateAsync({
        projectId: project.id,
        input: { name: trimmedProjectName },
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
    setProjectName(project.name);
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
    if (!project || !canDeleteProject || !isDeleteConfirmationValid) {
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
              <Input
                label={tProject("fields.projectName.label")}
                placeholder={tProject("fields.projectName.placeholder")}
                value={projectName}
                onChange={(event) => handleProjectNameChange(event.target.value)}
                disabled={!canEditProject || updateProjectMutation.isPending}
                error={
                  isProjectNameInvalid
                    ? tProject("validation.projectNameRequired")
                    : undefined
                }
                helperText={
                  canEditProject
                    ? tProject("permissions.editable")
                    : tProject("permissions.readOnly")
                }
              />

              {updateErrorMessage && <ErrorMessage message={updateErrorMessage} />}

              {updateProjectMutation.isSuccess && !isDirty && (
                <Text
                  variant="small"
                  className={styles["settings-page__status"]}
                >
                  {tProject("status.saved")}
                </Text>
              )}

              <div className={styles["settings-page__actions"]}>
                <Button
                  label={tProject("actions.reset")}
                  variant="secondary"
                  onClick={handleProjectReset}
                  disabled={!isDirty || updateProjectMutation.isPending}
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

            <ul className={styles["settings-page__capabilities"]}>
              <li className={styles["settings-page__capability"]}>
                <Text as="span" variant="small">
                  {canEditProject
                    ? tAccess("capabilities.renameAllowed")
                    : tAccess("capabilities.renameBlocked")}
                </Text>
              </li>
              <li className={styles["settings-page__capability"]}>
                <Text as="span" variant="small">
                  {canDeleteProject
                    ? tAccess("capabilities.deleteAllowed")
                    : tAccess("capabilities.deleteBlocked")}
                </Text>
              </li>
            </ul>
          </Card>
        </div>

        <ProjectPeopleSettingsSection projectId={project.id} />

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
                disabled={!canDeleteProject}
                aria-label={tDelete("openAriaLabel")}
              />
              {!canDeleteProject && (
                <Text
                  variant="small"
                  className={styles["settings-page__danger-hint"]}
                >
                  {role === ProjectRole.VIEWER
                    ? tDanger("readOnly")
                    : tDanger("adminOnly")}
                </Text>
              )}
            </div>
          </div>
        </Card>
      </section>

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
            name: project.name,
          })}
          value={deleteConfirmationName}
          onChange={(event) => setDeleteConfirmationName(event.target.value)}
          helperText={tDelete("confirmationHelper", {
            name: project.name,
          })}
          disabled={deleteProjectMutation.isPending}
        />

        {deleteErrorMessage && <ErrorMessage message={deleteErrorMessage} />}

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
            disabled={!isDeleteConfirmationValid || deleteProjectMutation.isPending}
          />
        </div>
      </Modal>
    </>
  );
};

export default ProjectSettingsPage;
