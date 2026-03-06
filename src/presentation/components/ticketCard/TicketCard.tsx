"use client";

import React, { useCallback, useMemo } from "react";

import TicketMeta from "@/presentation/components/ticketShared/TicketMeta";
import Button from "@/presentation/components/ui/Button";
import Title from "@/presentation/components/ui/Title";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";
import { buildTicketAriaLabel } from "@/shared/utils/ticketUtils";

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
    return buildTicketAriaLabel({
      ticketAriaLabel: t("ticketAriaLabel"),
      title,
      ticketCode,
      epicName,
      epicLabel: t("epicLabel"),
      assigneeName,
      assigneeLabel: t("assigneeLabel"),
      priority,
      priorityLabel: t("priorityLabel"),
      storyPointsLabel:
        typeof storyPoints === "number"
          ? t("storyPointsLabel", { count: storyPoints })
          : undefined,
    });
  }, [t, title, ticketCode, epicName, assigneeName, priority, storyPoints]);

  return (
    <article
      className={styles["ticket-card__row"]}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-label={cardAriaLabel}
    >
      <div className={styles["ticket-card__main"]}>
        <TicketMeta
          className={styles["ticket-card__meta"]}
          assigneeClassName={styles["ticket-card__assignee"]}
          ticketCodeClassName={styles["ticket-card__id"]}
          ticketCode={ticketCode}
          assigneeName={assigneeName}
          assigneeAvatarUrl={assigneeAvatarUrl}
          assigneeLabel={t("assigneeLabel")}
        />
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

export default React.memo(TicketCard);
