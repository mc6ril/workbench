import React, { useCallback } from "react";

import type { PendingInvitation } from "@/core/domain/schema/invitation.schema";

import Badge from "@/presentation/components/ui/Badge";
import Button from "@/presentation/components/ui/Button";
import Card from "@/presentation/components/ui/Card";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./PendingInvitations.module.scss";

type Props = {
  /** List of pending invitations for the current user */
  invitations: PendingInvitation[];
  /** Called when user accepts an invitation */
  onAccept: (token: string) => void;
  /** Called when user declines an invitation */
  onDecline: (token: string) => void;
  /** Whether a mutation is in progress */
  isLoading?: boolean;
};

/**
 * Displays pending project invitations for the current user.
 * Each invitation shows project name, inviter, role, and accept/decline actions.
 */
const PendingInvitations = ({
  invitations,
  onAccept,
  onDecline,
  isLoading = false,
}: Props) => {
  const t = useTranslation("forms.invitation.pending");
  const listId = getAccessibilityId("pending-invitations");

  const handleAccept = useCallback(
    (token: string) => {
      onAccept(token);
    },
    [onAccept]
  );

  const handleDecline = useCallback(
    (token: string) => {
      onDecline(token);
    },
    [onDecline]
  );

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div
      id={listId}
      className={styles["pending-invitations"]}
      role="region"
      aria-label={t("ariaLabel")}
    >
      <h3 className={styles["pending-invitations__title"]}>{t("title")}</h3>

      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <div className={styles["pending-invitations__item"]}>
            <div className={styles["pending-invitations__info"]}>
              <span className={styles["pending-invitations__project"]}>
                {invitation.projectName}
              </span>
              <span className={styles["pending-invitations__meta"]}>
                {t("invitedBy", { name: invitation.invitedByName })}
              </span>
              <Badge label={t(`role.${invitation.role}`)} />
            </div>

            <div className={styles["pending-invitations__actions"]}>
              <Button
                label={t("decline")}
                onClick={() => handleDecline(invitation.token)}
                variant="ghost"
                disabled={isLoading}
                aria-label={t("declineAriaLabel", {
                  project: invitation.projectName,
                })}
              />
              <Button
                label={t("accept")}
                onClick={() => handleAccept(invitation.token)}
                variant="primary"
                disabled={isLoading}
                aria-label={t("acceptAriaLabel", {
                  project: invitation.projectName,
                })}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default React.memo(PendingInvitations);
