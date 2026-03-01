"use client";

import React, { useCallback, useMemo } from "react";

import Badge from "@/presentation/components/ui/Badge";
import Button from "@/presentation/components/ui/Button";
import Card from "@/presentation/components/ui/Card";
import Stack from "@/presentation/components/ui/Stack";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./TicketCard.module.scss";

export type TicketCardProps = {
  id: string;
  title: string;
  status?: string;
  epicName?: string | null;
  assigneeName?: string | null;
  priority?: string | null;
  storyPoints?: number | null;
  onEdit?: (id: string) => void;
};

type Props = TicketCardProps;

const TicketCard = ({
  id,
  title,
  status,
  epicName,
  assigneeName,
  priority,
  storyPoints,
  onEdit,
}: Props) => {
  const t = useTranslation("pages.board.ticketCard");

  const baseId = useMemo(() => getAccessibilityId(`board-ticket-${id}`), [id]);

  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-meta`;

  const handleEdit = useCallback((): void => {
    if (onEdit) {
      onEdit(id);
    }
  }, [onEdit, id]);

  const cardAriaLabel = useMemo(() => {
    const parts: string[] = [title];

    if (status) {
      parts.push(`${t("statusLabel")}: ${status}`);
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
  }, [t, title, status, epicName, assigneeName, priority, storyPoints]);

  return (
    <div
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-label={cardAriaLabel}
    >
      <Card className={styles["ticket-card__card"]}>
        <div className={styles["ticket-card__header"]}>
          <Title
            id={titleId}
            variant="h3"
            className={styles["ticket-card__title"]}
          >
            {title}
          </Title>
          <Stack
            as="div"
            direction="horizontal"
            spacing="xs"
            className={styles["ticket-card__badges"]}
          >
            {status && (
              <Badge label={status} className={styles["ticket-card__status"]} />
            )}
            {priority && (
              <Badge
                label={priority}
                className={styles["ticket-card__priority"]}
              />
            )}
          </Stack>
        </div>
        <div
          id={descriptionId}
          className={styles["ticket-card__meta"]}
          aria-hidden="true"
        >
          <Stack as="div" direction="vertical" spacing="xs">
            {epicName && (
              <Text
                as="span"
                variant="caption"
                className={styles["ticket-card__epic"]}
              >
                {epicName}
              </Text>
            )}
            {assigneeName && (
              <Text
                as="span"
                variant="caption"
                className={styles["ticket-card__assignee"]}
              >
                {assigneeName}
              </Text>
            )}
            {typeof storyPoints === "number" && (
              <Text
                as="span"
                variant="caption"
                className={styles["ticket-card__story-points"]}
              >
                {storyPoints}
              </Text>
            )}
          </Stack>
        </div>
        <div className={styles["ticket-card__actions"]}>
          {onEdit && (
            <Button
              label={t("editTicketLabel")}
              onClick={handleEdit}
              variant="secondary"
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default TicketCard;
