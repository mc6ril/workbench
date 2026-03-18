"use client";

import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./EmptyState.module.scss";

type Props = {
  /** Empty state title text */
  title: string;
  /** Empty state message text (falls back to i18n default if not provided) */
  message?: string;
  /** Optional icon component to display */
  icon?: React.ReactNode;
  /** Optional action button or link */
  action?: React.ReactNode;
  /** Custom ARIA label for accessibility (falls back to title) */
  ariaLabel?: string;
  /** Additional CSS class name */
  className?: string;
};

/**
 * Reusable EmptyState component to display empty states for lists, tables, and content areas.
 * Includes full accessibility support with proper ARIA attributes and helpful messaging.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No tickets"
 *   message="Create your first ticket to get started"
 *   action={<Button label="Create Ticket" onClick={handleCreate} />}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="No results"
 *   message="Try adjusting your search filters"
 *   icon={<SearchIcon />}
 * />
 * ```
 */
const EmptyState = ({
  title,
  message,
  icon,
  action,
  ariaLabel,
  className,
}: Props) => {
  const t = useTranslation("common.emptyState");
  const displayMessage = message || t("defaultMessage");
  const displayAriaLabel = ariaLabel || title;
  const emptyStateId = getAccessibilityId("empty-state");
  const titleId = getAccessibilityId("empty-state-title");
  const messageId = getAccessibilityId("empty-state-message");

  const describedBy =
    [titleId, messageId].filter(Boolean).join(" ") || undefined;

  const emptyStateClasses = [styles["empty-state"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={emptyStateId}
      className={emptyStateClasses}
      role="status"
      aria-live="polite"
      aria-label={displayAriaLabel}
      aria-describedby={describedBy}
    >
      {icon && (
        <div className={styles["empty-state__icon"]} aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 id={titleId} className={styles["empty-state__title"]}>
        {title}
      </h2>
      {displayMessage && (
        <p id={messageId} className={styles["empty-state__message"]}>
          {displayMessage}
        </p>
      )}
      {action && <div className={styles["empty-state__action"]}>{action}</div>}
    </div>
  );
};

export default React.memo(EmptyState);
