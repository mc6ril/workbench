"use client";

import React, { useCallback, useMemo } from "react";

import Button from "@/presentation/components/ui/Button";
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
  ticketCode?: string | null;
  onOpen?: (id: string) => void;
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
  ticketCode,
}: Props) => {
  const t = useTranslation("pages.backlog.ticketListItem");

  const baseId = useMemo(
    () => getAccessibilityId(`backlog-ticket-${id}`),
    [id]
  );
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;

  const handleOpen = useCallback((): void => {
    if (onOpen) {
      onOpen(id);
    }
  }, [onOpen, id]);

  const itemClasses = [
    styles["ticket-list-item"],
    isSelected && styles["ticket-list-item--selected"],
  ]
    .filter(Boolean)
    .join(" ");

  const itemAriaLabel = useMemo(() => {
    const parts: string[] = [title];

    if (ticketCode) {
      parts.push(ticketCode);
    }

    if (status) {
      parts.push(`${t("statusLabel")}: ${status}`);
    }

    if (epicName) {
      parts.push(`${t("epicLabel")}: ${epicName}`);
    }

    return `${t("ticketAriaLabel")}: ${parts.join(", ")}`;
  }, [t, title, ticketCode, status, epicName]);

  return (
    <li
      className={itemClasses}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-label={itemAriaLabel}
    >
      <div className={styles["ticket-list-item__content"]}>
        <div className={styles["ticket-list-item__meta"]}>
          {ticketCode && (
            <Text
              as="span"
              variant="caption"
              className={styles["ticket-list-item__id"]}
            >
              {ticketCode}
            </Text>
          )}
        </div>
        <div className={styles["ticket-list-item__header"]}>
          <Text
            id={titleId}
            variant="body"
            className={styles["ticket-list-item__title"]}
          >
            {title}
          </Text>
        </div>
        <div className={styles["ticket-list-item__header"]}>
          {epicName && (
            <Text
              as="span"
              variant="caption"
              className={styles["ticket-list-item__title"]}
            >
              {epicName}
            </Text>
          )}
        </div>
      </div>
      <div className={styles["ticket-list-item__actions"]}>
        {onOpen && (
          <Button
            label={t("openTicketLabel")}
            onClick={handleOpen}
            variant="secondary"
          />
        )}
      </div>
    </li>
  );
};

export default React.memo(TicketListItem);
