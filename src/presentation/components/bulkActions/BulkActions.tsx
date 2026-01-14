"use client";

import React from "react";

import { Button, Text } from "@/presentation/components/ui";

import { useTranslation } from "@/shared/i18n";

import styles from "./BulkActions.module.scss";

type Props = {
  selectedCount: number;
  canDelete?: boolean;
  canMove?: boolean;
  canChangeStatus?: boolean;
  onDeleteSelected?: () => void;
  onMoveSelected?: () => void;
  onChangeStatusSelected?: () => void;
  className?: string;
};

const BulkActions = ({
  selectedCount,
  canDelete = true,
  canMove = true,
  canChangeStatus = true,
  onDeleteSelected,
  onMoveSelected,
  onChangeStatusSelected,
  className,
}: Props) => {
  const t = useTranslation("pages.backlog.bulkActions");

  const containerClasses = [styles["bulk-actions"], className]
    .filter(Boolean)
    .join(" ");

  const hasSelection = selectedCount > 0;

  return (
    <section className={containerClasses} aria-label={t("title")}>
      <Text
        as="p"
        variant="caption"
        className={styles["bulk-actions__summary"]}
      >
        {t("selectedCount", { count: selectedCount })}
      </Text>
      <div className={styles["bulk-actions__buttons"]}>
        {onMoveSelected && (
          <Button
            label={t("moveLabel")}
            onClick={onMoveSelected}
            variant="secondary"
            disabled={!hasSelection || !canMove}
            aria-label={t("moveLabel")}
          />
        )}
        {onChangeStatusSelected && (
          <Button
            label={t("changeStatusLabel")}
            onClick={onChangeStatusSelected}
            variant="secondary"
            disabled={!hasSelection || !canChangeStatus}
            aria-label={t("changeStatusLabel")}
          />
        )}
        {onDeleteSelected && (
          <Button
            label={t("deleteLabel")}
            onClick={onDeleteSelected}
            variant="danger"
            disabled={!hasSelection || !canDelete}
            aria-label={t("deleteLabel")}
          />
        )}
      </div>
    </section>
  );
};

export default BulkActions;
