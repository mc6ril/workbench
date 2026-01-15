"use client";

import React, { useCallback, useMemo } from "react";

import { Button, Checkbox, Stack, Text } from "@/presentation/components/ui";

import { BUTTON_LABELS, getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./SubtaskItem.module.scss";

type Props = {
  id: string;
  title: string;
  isCompleted: boolean;
  onToggleCompleted?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isBusy?: boolean;
  className?: string;
};

const SubtaskItem = ({
  id,
  title,
  isCompleted,
  onToggleCompleted,
  onEdit,
  onDelete,
  isBusy = false,
  className,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.subtasks.subtaskItem");
  const tCommon = useTranslation("common");

  const baseId = useMemo(() => getAccessibilityId(`subtask-${id}`), [id]);
  const titleId = `${baseId}-title`;

  const handleToggle = useCallback((): void => {
    if (onToggleCompleted) {
      onToggleCompleted(id);
    }
  }, [id, onToggleCompleted]);

  const handleEdit = useCallback((): void => {
    if (onEdit) {
      onEdit(id);
    }
  }, [id, onEdit]);

  const handleDelete = useCallback((): void => {
    if (onDelete) {
      onDelete(id);
    }
  }, [id, onDelete]);

  const containerClasses = [
    styles["subtask-item"],
    isCompleted && styles["subtask-item--completed"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const checkboxLabel = t("checkboxLabel", { title });

  return (
    <li className={containerClasses} aria-labelledby={titleId}>
      <div className={styles["subtask-item__main"]}>
        <Checkbox
          label={checkboxLabel}
          checked={isCompleted}
          disabled={isBusy || !onToggleCompleted}
          onChange={handleToggle}
        />
        <Text
          id={titleId}
          as="span"
          variant="body"
          className={styles["subtask-item__title"]}
        >
          {title}
        </Text>
      </div>

      <Stack
        as="div"
        direction="horizontal"
        spacing="xs"
        className={styles["subtask-item__actions"]}
      >
        {onEdit && (
          <Button
            label={t("editLabel")}
            onClick={handleEdit}
            variant="secondary"
            disabled={isBusy}
            aria-label={tCommon(BUTTON_LABELS.EDIT)}
          />
        )}
        {onDelete && (
          <Button
            label={t("deleteLabel")}
            onClick={handleDelete}
            variant="secondary"
            disabled={isBusy}
            aria-label={tCommon(BUTTON_LABELS.DELETE)}
          />
        )}
      </Stack>
    </li>
  );
};

export default React.memo(SubtaskItem);

