"use client";

import React, { useMemo } from "react";

import BoardColumn, {
  BoardColumnProps,
} from "@/presentation/components/boardColumn/BoardColumn";
import { Text, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./BoardView.module.scss";

export type BoardColumnConfig = {
  id: string;
  title: string;
  isVisible?: boolean;
};

export type BoardViewProps = {
  columns: BoardColumnConfig[];
  renderColumn: (config: BoardColumnConfig) => Omit<
    BoardColumnProps,
    "id" | "title"
  > & {
    tickets: BoardColumnProps["tickets"];
  };
  isLoading?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  className?: string;
};

const BoardView = ({
  columns,
  renderColumn,
  isLoading,
  isEmpty,
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
      <div className={styles["board-view__columns"]} role="list">
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
                  {...columnProps}
                />
              </div>
            );
          })}
      </div>
    </section>
  );
};

export default BoardView;
