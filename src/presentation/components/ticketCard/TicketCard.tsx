"use client";

import React, { useCallback, useMemo } from "react";

import Avatar from "@/presentation/components/ui/Avatar";
import Button from "@/presentation/components/ui/Button";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./TicketCard.module.scss";

export type TicketCardProps = {
  id: string;
  title: string;
  ticketCode?: string | null;
  status?: string;
  epicName?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  priority?: string | null;
  storyPoints?: number | null;
  onEdit?: (id: string) => void;
};

type Props = TicketCardProps;

const TicketCard = ({
  id,
  title,
  ticketCode,
  epicName,
  assigneeName,
  assigneeAvatarUrl,
  priority,
  storyPoints,
  onEdit,
}: Props) => {
  const t = useTranslation("pages.board.ticketCard");

  const baseId = useMemo(() => getAccessibilityId(`board-ticket-${id}`), [id]);

  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  const handleEdit = useCallback((): void => {
    if (onEdit) {
      onEdit(id);
    }
  }, [onEdit, id]);

  const cardAriaLabel = useMemo(() => {
    const parts: string[] = [title];

    if (ticketCode) {
      parts.push(ticketCode);
    }

    if (epicName) {
      parts.push(`${t("epicLabel")}: ${epicName}`);
    }

    if (assigneeName) {
      parts.push(`${t("assigneeLabel")}: ${assigneeName}`);
    }

    if (priority) {
      parts.push(`${t("priorityLabel")}: ${priority}`);
    }

    if (typeof storyPoints === "number") {
      parts.push(t("storyPointsLabel", { count: storyPoints }));
    }

    return `${t("ticketAriaLabel")}: ${parts.join(", ")}`;
  }, [t, title, ticketCode, epicName, assigneeName, priority, storyPoints]);

  return (
    <article
      className={styles["ticket-card__row"]}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-label={cardAriaLabel}
    >
      <div className={styles["ticket-card__main"]}>
        <div className={styles["ticket-card__meta"]}>
          <span className={styles["ticket-card__assignee"]}>
            <Avatar
              src={assigneeAvatarUrl ?? "/default-profile.svg"}
              name={assigneeName}
              size="sm"
              aria-label={
                assigneeName
                  ? `${t("assigneeLabel")}: ${assigneeName}`
                  : t("assigneeLabel")
              }
            />
          </span>
          {ticketCode && (
            <Text
              as="span"
              variant="caption"
              className={styles["ticket-card__id"]}
            >
              {ticketCode}
            </Text>
          )}
        </div>
        <Title
          id={titleId}
          variant="h3"
          className={styles["ticket-card__title"]}
        >
          {title}
        </Title>
      </div>
      <div className={styles["ticket-card__actions"]}>
        {onEdit && (
          <Button
            label={t("openTicketLabel")}
            onClick={handleEdit}
            variant="edit"
          />
        )}
      </div>
    </article>
  );
};

export default TicketCard;
