"use client";

import React, { useCallback, useMemo } from "react";

import { Button, Card, Checkbox, Input, Stack, Text, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./StatusesColumnsSettings.module.scss";

export type StatusColumnItem = {
  id: string;
  name: string;
  isEnabled: boolean;
};

type Props = {
  columns: StatusColumnItem[];
  isSaving?: boolean;
  errorMessage?: string | null;
  onChange: (columns: StatusColumnItem[]) => void;
  onCreate?: () => void;
  className?: string;
};

const StatusesColumnsSettings = ({
  columns,
  isSaving = false,
  errorMessage,
  onChange,
  onCreate,
  className,
}: Props) => {
  const t = useTranslation("pages.settings.statusesColumns");

  const sectionId = useMemo(() => getAccessibilityId("settings-statuses-columns"), []);
  const titleId = `${sectionId}-title`;

  const containerClasses = [styles["statuses-columns-settings"], className]
    .filter(Boolean)
    .join(" ");

  const handleToggleEnabled = useCallback(
    (id: string): void => {
      const updated = columns.map((column) =>
        column.id === id ? { ...column, isEnabled: !column.isEnabled } : column
      );
      onChange(updated);
    },
    [columns, onChange]
  );

  const handleRename = useCallback(
    (id: string, name: string): void => {
      const updated = columns.map((column) => (column.id === id ? { ...column, name } : column));
      onChange(updated);
    },
    [columns, onChange]
  );

  const handleMove = useCallback(
    (id: string, direction: "up" | "down"): void => {
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
    },
    [columns, onChange]
  );

  return (
    <section
      className={containerClasses}
      aria-labelledby={titleId}
      aria-busy={isSaving ? "true" : undefined}
    >
      <Card className={styles["statuses-columns-settings__card"]}>
        <header className={styles["statuses-columns-settings__header"]}>
          <div className={styles["statuses-columns-settings__header-text"]}>
            <Title
              id={titleId}
              variant="h2"
              className={styles["statuses-columns-settings__title"]}
            >
              {t("title")}
            </Title>
            <Text
              as="p"
              variant="caption"
              className={styles["statuses-columns-settings__subtitle"]}
            >
              {t("subtitle")}
            </Text>
          </div>
          {onCreate && (
            <Button
              label={t("actions.add")}
              onClick={onCreate}
              variant="secondary"
              disabled={isSaving}
            />
          )}
        </header>

        {errorMessage && (
          <div
            className={styles["statuses-columns-settings__status"]}
            role="alert"
            aria-live="assertive"
          >
            <Text as="p" variant="body" className={styles["statuses-columns-settings__status-error"]}>
              {errorMessage}
            </Text>
          </div>
        )}

        {columns.length === 0 ? (
          <div
            className={styles["statuses-columns-settings__empty"]}
            role="status"
            aria-live="polite"
          >
            <Text as="p" variant="body" className={styles["statuses-columns-settings__empty-title"]}>
              {t("empty.title")}
            </Text>
            <Text as="p" variant="caption" className={styles["statuses-columns-settings__empty-message"]}>
              {t("empty.message")}
            </Text>
          </div>
        ) : (
          <Stack
            as="ul"
            direction="vertical"
            spacing="xs"
            className={styles["statuses-columns-settings__list"]}
            aria-label={t("listAriaLabel")}
          >
            {columns.map((column, index) => {
              const canMoveUp = index > 0;
              const canMoveDown = index < columns.length - 1;
              const itemId = getAccessibilityId(`settings-status-column-${column.id}`);

              return (
                <li key={column.id} className={styles["statuses-columns-settings__item"]}>
                  <div className={styles["statuses-columns-settings__item-main"]}>
                    <Checkbox
                      id={`${itemId}-enabled`}
                      label={t("fields.enabled.label")}
                      checked={column.isEnabled}
                      onChange={() => handleToggleEnabled(column.id)}
                      disabled={isSaving}
                      aria-label={t("fields.enabled.ariaLabel", { name: column.name })}
                    />
                    <Input
                      id={`${itemId}-name`}
                      label={t("fields.name.label")}
                      value={column.name}
                      placeholder={t("fields.name.placeholder")}
                      onChange={(e) => handleRename(column.id, e.target.value)}
                      disabled={isSaving}
                      aria-label={t("fields.name.ariaLabel", { name: column.name })}
                    />
                  </div>

                  <div className={styles["statuses-columns-settings__item-actions"]}>
                    <Button
                      label={t("actions.moveUp")}
                      onClick={() => handleMove(column.id, "up")}
                      variant="ghost"
                      disabled={!canMoveUp || isSaving}
                      aria-label={t("actions.moveUpAriaLabel", { name: column.name })}
                    />
                    <Button
                      label={t("actions.moveDown")}
                      onClick={() => handleMove(column.id, "down")}
                      variant="ghost"
                      disabled={!canMoveDown || isSaving}
                      aria-label={t("actions.moveDownAriaLabel", { name: column.name })}
                    />
                  </div>
                </li>
              );
            })}
          </Stack>
        )}
      </Card>
    </section>
  );
};

export default React.memo(StatusesColumnsSettings);

