"use client";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ProjectRole } from "@/core/domain/schema/project.schema";
import { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import Button from "@/presentation/components/ui/Button";
import ErrorMessage from "@/presentation/components/ui/ErrorMessage";
import Input from "@/presentation/components/ui/Input";
import Modal from "@/presentation/components/ui/Modal";
import Select from "@/presentation/components/ui/Select";
import Text from "@/presentation/components/ui/Text";
import { useInviteMember } from "@/presentation/hooks/invitation/useInviteMember";
import { useDeleteProject } from "@/presentation/hooks/project/useDeleteProject";
import { useToastStore } from "@/presentation/stores/useToastStore";

import { getRoleLabelKey, useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { buildInvitationRoute } from "@/shared/utils/invitationUtils";

import styles from "./ProjectCardActions.module.scss";

type ProjectCardActionsProps = {
  projectId: string;
  projectName: string;
  currentPlan: SubscriptionPlan;
  isSubscriptionLoading: boolean;
};

const DEFAULT_INVITE_ROLE = ProjectRole.MEMBER;
const INVITE_ROLE_OPTIONS = Object.freeze([
  ProjectRole.VIEWER,
  ProjectRole.MEMBER,
  ProjectRole.ADMIN,
]);

const ProjectCardActions = ({
  projectId,
  projectName,
  currentPlan,
  isSubscriptionLoading,
}: ProjectCardActionsProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<ProjectRole>(DEFAULT_INVITE_ROLE);
  const [invitationLink, setInvitationLink] = useState("");

  const inviteMutation = useInviteMember();
  const deleteProjectMutation = useDeleteProject();
  const addToast = useToastStore((state) => state.addToast);

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

  const roleOptions = useMemo(
    () =>
      INVITE_ROLE_OPTIONS.map((role) => ({
        value: role,
        label: t(getRoleLabelKey(role)),
      })),
    [t]
  );

  const inviteErrorMessage = inviteMutation.error
    ? getErrorMessage(inviteMutation.error as { code?: string }, tErrors)
    : null;
  const deleteErrorMessage = deleteProjectMutation.error
    ? getErrorMessage(
        deleteProjectMutation.error as { code?: string },
        tErrors
      )
    : null;

  const stopCardInteraction = useCallback(
    (
      event:
        | ReactMouseEvent<HTMLElement>
        | ReactKeyboardEvent<HTMLElement>
    ) => {
      event.stopPropagation();
    },
    []
  );

  const resetInviteState = useCallback(() => {
    setInviteRole(DEFAULT_INVITE_ROLE);
    setInvitationLink("");
    inviteMutation.reset();
  }, [inviteMutation]);

  const openInviteModal = useCallback(() => {
    setMenuOpen(false);
    resetInviteState();
    setInviteModalOpen(true);
  }, [resetInviteState]);

  const closeInviteModal = useCallback(() => {
    setInviteModalOpen(false);
    resetInviteState();
  }, [resetInviteState]);

  const openDeleteModal = useCallback(() => {
    setMenuOpen(false);
    deleteProjectMutation.reset();
    setDeleteModalOpen(true);
  }, [deleteProjectMutation]);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    deleteProjectMutation.reset();
  }, [deleteProjectMutation]);

  const handleCreateInvitationLink = useCallback(async () => {
    try {
      const invitation = await inviteMutation.mutateAsync({
        input: {
          projectId,
          role: inviteRole,
        },
        currentPlan,
      });

      const nextLink =
        typeof window === "undefined"
          ? buildInvitationRoute(invitation.token)
          : `${window.location.origin}${buildInvitationRoute(invitation.token)}`;

      setInvitationLink(nextLink);
    } catch {
      // Error is rendered in the modal.
    }
  }, [currentPlan, inviteMutation, inviteRole, projectId]);

  const handleCopyInvitationLink = useCallback(async () => {
    if (!invitationLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationLink);
      addToast({
        message: t("actions.inviteCopySuccess"),
        variant: "success",
        duration: 4000,
      });
    } catch {
      addToast({
        message: tErrors("generic"),
        variant: "error",
        duration: 4000,
      });
    }
  }, [addToast, invitationLink, t, tErrors]);

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

      <Modal
        isOpen={inviteModalOpen}
        onClose={closeInviteModal}
        title={t("actions.inviteModalTitle")}
        size="medium"
      >
        <Text variant="small" className={styles["project-card-actions__description"]}>
          {t("actions.inviteModalDescription", { name: projectName })}
        </Text>

        {inviteErrorMessage && <ErrorMessage message={inviteErrorMessage} />}

        <div className={styles["project-card-actions__modal-content"]}>
          <Select
            label={t("actions.inviteRoleLabel")}
            aria-label={t("actions.inviteRoleAriaLabel")}
            options={roleOptions}
            value={inviteRole}
            disabled={inviteMutation.isPending}
            onChange={(event) => {
              setInviteRole(event.target.value as ProjectRole);
              setInvitationLink("");
              inviteMutation.reset();
            }}
          />

          {invitationLink && (
            <Input
              label={t("actions.inviteLinkLabel")}
              aria-label={t("actions.inviteLinkAriaLabel")}
              type="text"
              value={invitationLink}
              readOnly
            />
          )}
        </div>

        <div className={styles["project-card-actions__modal-actions"]}>
          {invitationLink ? (
            <Button
              label={t("actions.inviteCopyLink")}
              onClick={handleCopyInvitationLink}
              aria-label={t("actions.inviteCopyLinkAriaLabel")}
            />
          ) : (
            <Button
              label={t("actions.inviteCreateLink")}
              onClick={handleCreateInvitationLink}
              disabled={inviteMutation.isPending || isSubscriptionLoading}
              aria-label={t("actions.inviteCreateLinkAriaLabel")}
            />
          )}
          <Button
            label={t("actions.inviteModalClose")}
            variant="secondary"
            onClick={closeInviteModal}
            aria-label={t("actions.inviteModalCloseAriaLabel")}
          />
        </div>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title={t("actions.deleteModalTitle")}
        size="medium"
      >
        <Text variant="small" className={styles["project-card-actions__description"]}>
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
