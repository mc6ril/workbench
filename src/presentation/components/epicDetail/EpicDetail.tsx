"use client";

import React, { useMemo } from "react";

import type { EpicDetail as EpicDetailType } from "@/core/domain/schema/epic.schema";

import EpicProgress from "@/presentation/components/epicProgress/EpicProgress";
import { Button, Text, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./EpicDetail.module.scss";

type Props = {
  epic: EpicDetailType;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
};

/**
 * EpicDetail component displays full epic information including progress and linked tickets.
 * Includes full accessibility support with proper ARIA attributes.
 */
const EpicDetail = ({ epic, onEdit, onDelete, className }: Props) => {
  const t = useTranslation("pages.epics.epicDetail");

  const detailId = useMemo(
    () => getAccessibilityId(`epic-detail-${epic.id}`),
    [epic.id]
  );

  const titleId = `${detailId}-title`;
  const descriptionId = `${detailId}-description`;
  const ticketsId = `${detailId}-tickets`;

  const handleEdit = (): void => {
    if (onEdit) {
      onEdit(epic.id);
    }
  };

  const handleDelete = (): void => {
    if (onDelete) {
      onDelete(epic.id);
    }
  };

  const detailClasses = [styles["epic-detail"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={detailClasses} aria-labelledby={titleId}>
      <div className={styles["epic-detail__header"]}>
        <Title
          id={titleId}
          variant="h1"
          className={styles["epic-detail__title"]}
        >
          {epic.name}
        </Title>
        <div className={styles["epic-detail__actions"]}>
          {onEdit && (
            <Button
              label={t("editLabel")}
              onClick={handleEdit}
              variant="secondary"
            />
          )}
          {onDelete && (
            <Button
              label={t("deleteLabel")}
              onClick={handleDelete}
              variant="secondary"
            />
          )}
        </div>
      </div>

      {epic.description && (
        <Text
          id={descriptionId}
          as="p"
          variant="body"
          className={styles["epic-detail__description"]}
        >
          {epic.description}
        </Text>
      )}

      <div className={styles["epic-detail__progress"]}>
        <EpicProgress progress={epic.progress} id={epic.id} />
      </div>

      <section
        className={styles["epic-detail__tickets"]}
        aria-labelledby={ticketsId}
      >
        <Title
          id={ticketsId}
          variant="h2"
          className={styles["epic-detail__tickets-title"]}
        >
          {t("ticketsTitle")}
        </Title>
        {epic.tickets.length === 0 ? (
          <Text
            as="p"
            variant="body"
            className={styles["epic-detail__no-tickets"]}
          >
            {t("noTickets")}
          </Text>
        ) : (
          <ul className={styles["epic-detail__tickets-list"]}>
            {epic.tickets.map((ticket) => (
              <li
                key={ticket.id}
                className={styles["epic-detail__ticket-item"]}
              >
                <Text
                  as="span"
                  variant="body"
                  className={styles["epic-detail__ticket-title"]}
                >
                  {ticket.title}
                </Text>
                {ticket.status && (
                  <Text
                    as="span"
                    variant="caption"
                    className={styles["epic-detail__ticket-status"]}
                  >
                    {ticket.status}
                  </Text>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
};

export default React.memo(EpicDetail);
