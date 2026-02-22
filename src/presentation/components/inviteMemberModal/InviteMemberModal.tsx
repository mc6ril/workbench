import React, { useCallback, useMemo, useState } from "react";

import { ProjectRole } from "@/core/domain/schema/project.schema";

import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import Modal from "@/presentation/components/ui/Modal";
import Select from "@/presentation/components/ui/Select";

import { useTranslation } from "@/shared/i18n";

import styles from "./InviteMemberModal.module.scss";

type Props = {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when modal is closed */
  onClose: () => void;
  /** Called when invitation is submitted */
  onInvite: (email: string, role: ProjectRole) => void;
  /** Whether the invite mutation is in progress */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
};

/**
 * Modal for inviting a new member to a project.
 * Provides email input and role selection.
 */
const InviteMemberModal = ({
  isOpen,
  onClose,
  onInvite,
  isLoading = false,
  error,
}: Props) => {
  const t = useTranslation("forms.invitation");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>(ProjectRole.MEMBER);

  const roleOptions = useMemo(
    () => [
      { value: ProjectRole.MEMBER, label: t("role.member") },
      { value: ProjectRole.VIEWER, label: t("role.viewer") },
      { value: ProjectRole.ADMIN, label: t("role.admin") },
    ],
    [t]
  );

  const handleSubmit = useCallback(() => {
    if (email.trim()) {
      onInvite(email.trim(), role);
    }
  }, [email, role, onInvite]);

  const handleClose = useCallback(() => {
    setEmail("");
    setRole(ProjectRole.MEMBER);
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("title")}
      aria-label={t("ariaLabel")}
    >
      <div className={styles["invite-modal"]}>
        <Input
          label={t("emailLabel")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          aria-label={t("emailAriaLabel")}
        />

        <Select
          label={t("roleLabel")}
          value={role}
          onChange={(e) => setRole(e.target.value as ProjectRole)}
          options={roleOptions}
          aria-label={t("roleAriaLabel")}
        />

        {error && (
          <p className={styles["invite-modal__error"]} role="alert">
            {error}
          </p>
        )}

        <div className={styles["invite-modal__actions"]}>
          <Button
            label={t("cancel")}
            onClick={handleClose}
            variant="secondary"
            disabled={isLoading}
          />
          <Button
            label={isLoading ? t("sending") : t("send")}
            onClick={handleSubmit}
            variant="primary"
            disabled={isLoading || !email.trim()}
            aria-label={t("sendAriaLabel")}
          />
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(InviteMemberModal);
