"use client";

import React, { useMemo } from "react";

import BoardColumn from "@/presentation/components/board/boardColumn/BoardColumn";
import type { BoardViewProps } from "@/presentation/components/board/boardView/BoardView.types";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./BoardView.module.scss";

const BoardView = ({
  columns,
  renderColumn,
  isLoading,
  isEmpty,
  isDragging,
  errorMessage,
  className,
}: BoardViewProps) => {
  const t = useTranslation("pages.board.view");

  const containerId = useMemo(() => getAccessibilityId("board-view"), []);

  const containerClasses = [styles["board-view"], className]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <section
        className={containerClasses}
        aria-labelledby={containerId}
        aria-busy="true"
      >
        <Title id={containerId} variant="h2" className="visually-hidden">
          {t("title")}
        </Title>
        <Text as="p" variant="body" className={styles["board-view__message"]}>
          {t("loading")}
        </Text>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section
        className={containerClasses}
        aria-labelledby={containerId}
        aria-live="assertive"
      >
        <Title id={containerId} variant="h2" className="visually-hidden">
          {t("title")}
        </Title>
        <Text as="p" variant="body" className={styles["board-view__message"]}>
          {errorMessage}
        </Text>
      </section>
    );
  }

  if (isEmpty) {
    return (
      <section
        className={containerClasses}
        aria-labelledby={containerId}
        aria-live="polite"
      >
        <Title id={containerId} variant="h2" className="visually-hidden">
          {t("title")}
        </Title>
        <Text as="p" variant="body" className={styles["board-view__message"]}>
          {t("emptyMessage")}
        </Text>
      </section>
    );
  }

  return (
    <section
      className={containerClasses}
      aria-labelledby={containerId}
      aria-label={t("ariaLabel")}
    >
      <Title id={containerId} variant="h2" className="visually-hidden">
        {t("title")}
      </Title>
      <div
        className={styles["board-view__columns"]}
        role="list"
        data-dragging={isDragging}
      >
        {columns
          .filter((column) => column.isVisible !== false)
          .map((column) => {
            const columnProps = renderColumn(column);

            return (
              <div
                key={column.id}
                role="listitem"
                className={styles["board-view__column-wrapper"]}
              >
                <BoardColumn
                  id={column.id}
                  title={column.title}
                  isDragging={isDragging}
                  {...columnProps}
                />
              </div>
            );
          })}
      </div>
    </section>
  );
};

export default React.memo(BoardView);
