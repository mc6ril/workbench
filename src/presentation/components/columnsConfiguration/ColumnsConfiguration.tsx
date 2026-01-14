"use client";

import React from "react";

import { Button, Checkbox, Stack, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./ColumnsConfiguration.module.scss";

export type ColumnConfigurationItem = {
  id: string;
  title: string;
  isVisible: boolean;
};

export type ColumnsConfigurationProps = {
  columns: ColumnConfigurationItem[];
  onChange: (columns: ColumnConfigurationItem[]) => void;
  onClose?: () => void;
  className?: string;
};

const ColumnsConfiguration = ({
  columns,
  onChange,
  onClose,
  className,
}: ColumnsConfigurationProps) => {
  const t = useTranslation("pages.board.columnsConfiguration");

  const sectionId = getAccessibilityId("board-columns-configuration");

  const containerClasses = [styles["columns-configuration"], className]
    .filter(Boolean)
    .join(" ");

  const handleToggleVisibility = (id: string): void => {
    const updated = columns.map((column) =>
      column.id === id
        ? {
            ...column,
            isVisible: !column.isVisible,
          }
        : column
    );

    onChange(updated);
  };

  const handleMove = (id: string, direction: "up" | "down"): void => {
    const index = columns.findIndex((column) => column.id === id);

    if (index === -1) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= columns.length) {
      return;
    }

    const updated = [...columns];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    onChange(updated);
  };

  return (
    <section
      className={containerClasses}
      aria-labelledby={sectionId}
      aria-label={t("ariaLabel")}
    >
      <header className={styles["columns-configuration__header"]}>
        <Title
          id={sectionId}
          variant="h2"
          className={styles["columns-configuration__title"]}
        >
          {t("title")}
        </Title>
        {onClose && (
          <Button
            label={t("closeLabel")}
            onClick={onClose}
            variant="secondary"
          />
        )}
      </header>
      <Stack
        as="ul"
        direction="vertical"
        spacing="xs"
        className={styles["columns-configuration__list"]}
      >
        {columns.map((column, index) => {
          const canMoveUp = index > 0;
          const canMoveDown = index < columns.length - 1;

          return (
            <li
              key={column.id}
              className={styles["columns-configuration__item"]}
            >
              <div className={styles["columns-configuration__item-main"]}>
                <Checkbox
                  label={column.title}
                  checked={column.isVisible}
                  onChange={() => handleToggleVisibility(column.id)}
                />
              </div>
              <div className={styles["columns-configuration__item-actions"]}>
                <Button
                  label={t("moveUpLabel")}
                  onClick={() => handleMove(column.id, "up")}
                  variant="ghost"
                  aria-label={t("moveUpAriaLabel", { title: column.title })}
                  disabled={!canMoveUp}
                />
                <Button
                  label={t("moveDownLabel")}
                  onClick={() => handleMove(column.id, "down")}
                  variant="ghost"
                  aria-label={t("moveDownAriaLabel", { title: column.title })}
                  disabled={!canMoveDown}
                />
              </div>
            </li>
          );
        })}
      </Stack>
    </section>
  );
};

export default ColumnsConfiguration;
