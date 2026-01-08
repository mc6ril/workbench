"use client";

import React from "react";

import styles from "@/styles/components/ui/EmptyState.module.scss";

import { useTranslation } from "@/shared/i18n";

import Text from "./Text";
import Title from "./Title";

type Props = {
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

const EmptyState = ({
  title,
  message,
  action,
  className,
  "aria-label": ariaLabel,
}: Props) => {
  const t = useTranslation("common.emptyState");
  const displayMessage = message || t("defaultMessage");

  const emptyStateClasses = [styles["empty-state"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={emptyStateClasses}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || title}
    >
      <Title variant="h2" className={styles["empty-state__title"]}>
        {title}
      </Title>
      {displayMessage && (
        <Text variant="body" className={styles["empty-state__message"]}>
          {displayMessage}
        </Text>
      )}
      {action && <div className={styles["empty-state__action"]}>{action}</div>}
    </div>
  );
};

export default React.memo(EmptyState);
