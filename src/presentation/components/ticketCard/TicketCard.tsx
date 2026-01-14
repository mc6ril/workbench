"use client";

import React, { useMemo } from "react";

import {
  Badge,
  Button,
  Card,
  Stack,
  Text,
  Title,
} from "@/presentation/components/ui";

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
  onOpen?: (id: string) => void;
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
  onOpen,
  onEdit,
}: Props) => {
  const t = useTranslation("pages.board.ticketCard");

  const baseId = useMemo(() => getAccessibilityId(`board-ticket-${id}`), [id]);

  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-meta`;

  const handleOpen = (): void => {
    if (onOpen) {
      onOpen(id);
    }
  };

  const handleEdit = (): void => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const ariaLabelParts: string[] = [title];

  if (status) {
    ariaLabelParts.push(`${t("statusLabel")}: ${status}`);
  }

  if (epicName) {
    ariaLabelParts.push(`${t("epicLabel")}: ${epicName}`);
  }

  if (assigneeName) {
    ariaLabelParts.push(`${t("assigneeLabel")}: ${assigneeName}`);
  }

  if (priority) {
    ariaLabelParts.push(`${t("priorityLabel")}: ${priority}`);
  }

  if (typeof storyPoints === "number") {
    ariaLabelParts.push(
      t("storyPointsLabel", {
        count: storyPoints,
      })
    );
  }

  const cardAriaLabel = `${t("ticketAriaLabel")}: ${ariaLabelParts.join(", ")}`;

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
          {onOpen && (
            <Button
              label={t("openTicketLabel")}
              onClick={handleOpen}
              variant="secondary"
            />
          )}
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
