"use client";

import React, { useMemo } from "react";

import SubtaskItem from "@/presentation/components/subtaskItem/SubtaskItem";
import { EmptyState, ErrorMessage, Loader, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./SubtasksList.module.scss";

export type SubtaskViewModel = {
  id: string;
  title: string;
  isCompleted: boolean;
};

type Props = {
  subtasks: SubtaskViewModel[];
  isLoading?: boolean;
  errorMessage?: string;
  onToggleCompleted?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  emptyStateAction?: React.ReactNode;
  className?: string;
};

const SubtasksList = ({
  subtasks,
  isLoading = false,
  errorMessage,
  onToggleCompleted,
  onEdit,
  onDelete,
  emptyStateAction,
  className,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.subtasks.list");

  const baseId = useMemo(() => getAccessibilityId("ticket-subtasks"), []);
  const titleId = `${baseId}-title`;

  const containerClasses = [styles["subtasks-list"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={containerClasses}
      aria-label={t("ariaLabel")}
      aria-labelledby={titleId}
    >
      <header className={styles["subtasks-list__header"]}>
        <Title id={titleId} variant="h3" className={styles["subtasks-list__title"]}>
          {t("title")}
        </Title>
      </header>

      {isLoading && (
        <div className={styles["subtasks-list__state"]}>
          <Loader ariaLabel={t("loadingAriaLabel")} />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className={styles["subtasks-list__state"]}>
          <ErrorMessage message={errorMessage} title={t("errorTitle")} />
        </div>
      )}

      {!isLoading && !errorMessage && subtasks.length === 0 && (
        <div className={styles["subtasks-list__state"]}>
          <EmptyState
            title={t("emptyTitle")}
            message={t("emptyMessage")}
            action={emptyStateAction}
            ariaLabel={t("emptyAriaLabel")}
          />
        </div>
      )}

      {!isLoading && !errorMessage && subtasks.length > 0 && (
        <ul className={styles["subtasks-list__items"]} aria-label={t("itemsAriaLabel")}>
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              id={subtask.id}
              title={subtask.title}
              isCompleted={subtask.isCompleted}
              onToggleCompleted={onToggleCompleted}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default React.memo(SubtasksList);

