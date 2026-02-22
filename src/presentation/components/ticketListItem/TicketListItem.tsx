"use client";

import React, { useCallback, useMemo } from "react";

import Badge from "@/presentation/components/ui/Badge";
import Button from "@/presentation/components/ui/Button";
import Checkbox from "@/presentation/components/ui/Checkbox";
import Text from "@/presentation/components/ui/Text";

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

  const handleToggleSelect = useCallback((): void => {
    if (onToggleSelect) {
      onToggleSelect(id);
    }
  }, [onToggleSelect, id]);

  const handleOpen = useCallback((): void => {
    if (onOpen) {
      onOpen(id);
    }
  }, [onOpen, id]);

  const handleEdit = useCallback((): void => {
    if (onEdit) {
      onEdit(id);
    }
  }, [onEdit, id]);

  const itemClasses = [
    styles["ticket-list-item"],
    isSelected && styles["ticket-list-item--selected"],
  ]
    .filter(Boolean)
    .join(" ");

  const itemAriaLabel = useMemo(() => {
    const parts: string[] = [title];

    if (status) {
      parts.push(`${t("statusLabel")}: ${status}`);
    }

    if (epicName) {
      parts.push(`${t("epicLabel")}: ${epicName}`);
    }

    return `${t("ticketAriaLabel")}: ${parts.join(", ")}`;
  }, [t, title, status, epicName]);

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

export default React.memo(TicketListItem);
