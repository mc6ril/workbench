"use client";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import Button from "@/shared/design-system/button";
import ErrorMessage from "@/shared/design-system/error_message";
import Modal from "@/shared/design-system/modal";
import Text from "@/shared/design-system/text";
import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import styles from "./ProjectCardActions.module.scss";

import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.schema";
import InviteProjectModal from "@/domains/project/presentation/components/inviteProjectModal/InviteProjectModal";
import { useDeleteProject } from "@/domains/project/presentation/hooks/useDeleteProject";
import ProjectMembersModal from "@/domains/workspace/presentation/components/workspace/projectModal/ProjectMembersModal";

type ProjectCardActionsProps = {
  projectId: string;
  projectName: string;
  currentPlan: SubscriptionPlan;
  isSubscriptionLoading: boolean;
};

const ProjectCardActions = ({
  projectId,
  projectName,
  currentPlan,
  isSubscriptionLoading,
}: ProjectCardActionsProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const deleteProjectMutation = useDeleteProject();

  const t = useTranslation("pages.workspace");
  const tErrors = useTranslation("errors");

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [menuOpen]);

  const deleteErrorMessage = deleteProjectMutation.error
    ? getErrorMessage(deleteProjectMutation.error as { code?: string }, tErrors)
    : null;

  const stopCardInteraction = useCallback(
    (event: ReactMouseEvent<HTMLElement> | ReactKeyboardEvent<HTMLElement>) => {
      event.stopPropagation();
    },
    []
  );

  const openInviteModal = useCallback(() => {
    setMenuOpen(false);
    setInviteModalOpen(true);
  }, []);

  const closeInviteModal = useCallback(() => {
    setInviteModalOpen(false);
  }, []);

  const openDeleteModal = useCallback(() => {
    setMenuOpen(false);
    deleteProjectMutation.reset();
    setDeleteModalOpen(true);
  }, [deleteProjectMutation]);

  const openMembersModal = useCallback(() => {
    setMenuOpen(false);
    setMembersModalOpen(true);
  }, []);

  const closeMembersModal = useCallback(() => {
    setMembersModalOpen(false);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    deleteProjectMutation.reset();
  }, [deleteProjectMutation]);

  const handleDeleteProject = useCallback(async () => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      closeDeleteModal();
    } catch {
      // Error is rendered in the modal.
    }
  }, [closeDeleteModal, deleteProjectMutation, projectId]);

  return (
    <>
      <div
        ref={menuRef}
        className={styles["project-card-actions"]}
        onClick={stopCardInteraction}
        onKeyDown={stopCardInteraction}
      >
        <button
          type="button"
          className={styles["project-card-actions__toggle"]}
          aria-label={t("actions.openMenuAriaLabel", { name: projectName })}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => {
            setMenuOpen((current) => !current);
          }}
        >
          ⋯
        </button>

        {menuOpen && (
          <div
            className={styles["project-card-actions__menu"]}
            role="menu"
            aria-label={t("actions.menuAriaLabel", { name: projectName })}
          >
            <button
              type="button"
              className={styles["project-card-actions__item"]}
              role="menuitem"
              onClick={openMembersModal}
            >
              {t("actions.manageMembers")}
            </button>
            <button
              type="button"
              className={styles["project-card-actions__item"]}
              role="menuitem"
              onClick={openInviteModal}
            >
              {t("actions.inviteProject")}
            </button>
            <button
              type="button"
              className={`${styles["project-card-actions__item"]} ${styles["project-card-actions__item--danger"]}`}
              role="menuitem"
              onClick={openDeleteModal}
            >
              {t("actions.deleteProject")}
            </button>
          </div>
        )}
      </div>

      {membersModalOpen && (
        <ProjectMembersModal
          isOpen={membersModalOpen}
          onClose={closeMembersModal}
          projectId={projectId}
          projectName={projectName}
        />
      )}

      {inviteModalOpen && (
        <InviteProjectModal
          isOpen={inviteModalOpen}
          onClose={closeInviteModal}
          projectId={projectId}
          projectName={projectName}
          currentPlan={currentPlan}
          isSubscriptionLoading={isSubscriptionLoading}
        />
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title={t("actions.deleteModalTitle")}
        size="medium"
      >
        <Text
          variant="small"
          className={styles["project-card-actions__description"]}
        >
          {t("actions.deleteModalDescription", { name: projectName })}
        </Text>

        {deleteErrorMessage && <ErrorMessage message={deleteErrorMessage} />}

        <div className={styles["project-card-actions__modal-actions"]}>
          <Button
            label={t("actions.deleteModalConfirm")}
            variant="danger"
            onClick={handleDeleteProject}
            disabled={deleteProjectMutation.isPending}
            aria-label={t("actions.deleteModalConfirmAriaLabel")}
          />
          <Button
            label={t("actions.deleteModalCancel")}
            variant="secondary"
            onClick={closeDeleteModal}
            aria-label={t("actions.deleteModalCancelAriaLabel")}
          />
        </div>
      </Modal>
    </>
  );
};

export default ProjectCardActions;
