"use client";

import { useCallback, useMemo, useState } from "react";

import Button from "@/shared/design-system/button";
import ErrorMessage from "@/shared/design-system/error_message";
import Input from "@/shared/design-system/input";
import Modal from "@/shared/design-system/modal";
import Select from "@/shared/design-system/select";
import Text from "@/shared/design-system/text";
import { getRoleLabelKey, useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { useToastStore } from "@/shared/stores/useToastStore";

import {
  DEFAULT_INVITE_ROLE,
  INVITE_ROLE_DESCRIPTION_KEYS,
  INVITE_ROLE_OPTIONS,
} from "./InviteProjectModal.constants";
import styles from "./InviteProjectModal.module.scss";

import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.schema";
import type { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import { useInviteMember } from "@/domains/project/presentation/hooks/invitation/useInviteMember";
import { buildInvitationRoute } from "@/domains/project/utils/invitationUtils";

type InviteProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentPlan: SubscriptionPlan;
  isSubscriptionLoading: boolean;
};

const InviteProjectModal = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  currentPlan,
  isSubscriptionLoading,
}: InviteProjectModalProps) => {
  const [inviteRole, setInviteRole] =
    useState<ProjectRole>(DEFAULT_INVITE_ROLE);
  const [invitationLink, setInvitationLink] = useState("");

  const inviteMutation = useInviteMember();
  const addToast = useToastStore((state) => state.addToast);
  const t = useTranslation("pages.workspace");
  const tErrors = useTranslation("errors");

  const roleOptions = useMemo(
    () =>
      INVITE_ROLE_OPTIONS.map((role) => ({
        value: role,
        label: t(getRoleLabelKey(role)),
      })),
    [t]
  );

  const hasInvitationLink = invitationLink.length > 0;
  const selectedRoleLabel = t(getRoleLabelKey(inviteRole));
  const selectedRoleDescription = t(INVITE_ROLE_DESCRIPTION_KEYS[inviteRole]);
  const invitationStatusLabel = hasInvitationLink
    ? t("actions.inviteStatusReady")
    : t("actions.inviteStatusDraft");
  const inviteErrorMessage = inviteMutation.error
    ? getErrorMessage(inviteMutation.error as { code?: string }, tErrors)
    : null;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("actions.inviteModalTitle")}
      size="medium"
    >
      <div className={styles["invite-project-modal__shell"]}>
        <section className={styles["invite-project-modal__hero"]}>
          <div className={styles["invite-project-modal__eyebrow"]}>
            {t("actions.inviteHeroEyebrow")}
          </div>
          <div className={styles["invite-project-modal__project-name"]}>
            {projectName}
          </div>
          <Text
            variant="small"
            className={styles["invite-project-modal__description"]}
          >
            {t("actions.inviteModalDescription", { name: projectName })}
          </Text>
          <div className={styles["invite-project-modal__pills"]}>
            <span className={styles["invite-project-modal__pill"]}>
              {t("actions.invitePillSingleUse")}
            </span>
            <span className={styles["invite-project-modal__pill"]}>
              {t("actions.invitePillExpiring")}
            </span>
            <span
              className={`${styles["invite-project-modal__pill"]} ${
                hasInvitationLink
                  ? styles["invite-project-modal__pill--success"]
                  : styles["invite-project-modal__pill--muted"]
              }`}
            >
              {invitationStatusLabel}
            </span>
          </div>
        </section>

        {inviteErrorMessage && <ErrorMessage message={inviteErrorMessage} />}

        <div className={styles["invite-project-modal__grid"]}>
          <section className={styles["invite-project-modal__card"]}>
            <div className={styles["invite-project-modal__section-header"]}>
              <div className={styles["invite-project-modal__section-title"]}>
                {t("actions.inviteRoleSectionTitle")}
              </div>
              <Text
                variant="small"
                className={styles["invite-project-modal__section-description"]}
              >
                {t("actions.inviteRoleSectionDescription")}
              </Text>
            </div>

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

            <div
              className={`${styles["invite-project-modal__role-preview"]} ${
                styles[`invite-project-modal__role-preview--${inviteRole}`]
              }`}
            >
              <span
                className={`${styles["invite-project-modal__role-pill"]} ${
                  styles[`invite-project-modal__role-pill--${inviteRole}`]
                }`}
              >
                {selectedRoleLabel}
              </span>
              <Text
                variant="small"
                className={styles["invite-project-modal__role-description"]}
              >
                {selectedRoleDescription}
              </Text>
            </div>
          </section>

          <section
            className={`${styles["invite-project-modal__card"]} ${
              hasInvitationLink
                ? styles["invite-project-modal__card--ready"]
                : ""
            }`}
          >
            <div className={styles["invite-project-modal__section-header"]}>
              <div className={styles["invite-project-modal__section-title"]}>
                {t("actions.inviteLinkSectionTitle")}
              </div>
              <Text
                variant="small"
                className={styles["invite-project-modal__section-description"]}
              >
                {t("actions.inviteLinkSectionDescription")}
              </Text>
            </div>

            {hasInvitationLink ? (
              <>
                <div className={styles["invite-project-modal__link-ready"]}>
                  <div
                    className={styles["invite-project-modal__link-ready-title"]}
                  >
                    {t("actions.inviteLinkReadyTitle")}
                  </div>
                  <Text
                    variant="small"
                    className={
                      styles["invite-project-modal__link-ready-description"]
                    }
                  >
                    {t("actions.inviteLinkReadyDescription")}
                  </Text>
                </div>

                <Input
                  label={t("actions.inviteLinkLabel")}
                  aria-label={t("actions.inviteLinkAriaLabel")}
                  type="text"
                  value={invitationLink}
                  helperText={t("actions.inviteLinkHelper")}
                  readOnly
                />
              </>
            ) : (
              <div className={styles["invite-project-modal__link-placeholder"]}>
                <div
                  className={
                    styles["invite-project-modal__link-placeholder-title"]
                  }
                >
                  {t("actions.inviteLinkPlaceholderTitle")}
                </div>
                <Text
                  variant="small"
                  className={
                    styles["invite-project-modal__link-placeholder-description"]
                  }
                >
                  {t("actions.inviteLinkPlaceholderDescription")}
                </Text>
              </div>
            )}
          </section>
        </div>

        <div className={styles["invite-project-modal__actions"]}>
          {hasInvitationLink ? (
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
            onClick={handleClose}
            aria-label={t("actions.inviteModalCloseAriaLabel")}
          />
        </div>
      </div>
    </Modal>
  );
};

export default InviteProjectModal;
