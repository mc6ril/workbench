"use client";

import React, { useMemo } from "react";

import { Badge, Button, Checkbox, Text } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./TicketListItem.module.scss";

export type TicketListItemProps = {
  id: string;
  title: string;
  status?: string;
  epicName?: string | null;
  description?: string | null;
  isSelected?: boolean;
  onOpen?: (id: string) => void;
  onEdit?: (id: string) => void;
  onToggleSelect?: (id: string) => void;
};

type Props = TicketListItemProps;

const TicketListItem = ({
  id,
  title,
  status,
  epicName,
  description,
  isSelected = false,
  onOpen,
  onEdit,
  onToggleSelect,
}: Props) => {
  const t = useTranslation("pages.backlog.ticketListItem");

  const baseId = useMemo(
    () => getAccessibilityId(`backlog-ticket-${id}`),
    [id]
  );
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;

  const handleToggleSelect = (): void => {
    if (onToggleSelect) {
      onToggleSelect(id);
    }
  };

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

  const itemClasses = [
    styles["ticket-list-item"],
    isSelected && styles["ticket-list-item--selected"],
  ]
    .filter(Boolean)
    .join(" ");

  const ariaLabelParts: string[] = [title];

  if (status) {
    ariaLabelParts.push(`${t("statusLabel")}: ${status}`);
  }

  if (epicName) {
    ariaLabelParts.push(`${t("epicLabel")}: ${epicName}`);
  }

  const itemAriaLabel = `${t("ticketAriaLabel")}: ${ariaLabelParts.join(", ")}`;

  return (
    <li
      className={itemClasses}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-label={itemAriaLabel}
    >
      <div className={styles["ticket-list-item__selection"]}>
        {onToggleSelect && (
          <Checkbox
            label={t("selectTicketLabel")}
            checked={isSelected}
            onChange={handleToggleSelect}
            aria-label={t("selectTicketLabel")}
          />
        )}
      </div>
      <div className={styles["ticket-list-item__content"]}>
        <div className={styles["ticket-list-item__header"]}>
          <Text
            id={titleId}
            variant="body"
            className={styles["ticket-list-item__title"]}
          >
            {title}
          </Text>
        </div>
        <div className={styles["ticket-list-item__meta"]}>
          {epicName && (
            <Text
              as="span"
              variant="caption"
              className={styles["ticket-list-item__epic"]}
            >
              {epicName}
            </Text>
          )}
          {status && (
            <Badge
              label={status}
              className={styles["ticket-list-item__status"]}
            />
          )}
        </div>
        {description && (
          <Text
            id={descriptionId}
            as="p"
            variant="body"
            className={styles["ticket-list-item__description"]}
          >
            {description}
          </Text>
        )}
      </div>
      <div className={styles["ticket-list-item__actions"]}>
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
    </li>
  );
};

export default TicketListItem;
