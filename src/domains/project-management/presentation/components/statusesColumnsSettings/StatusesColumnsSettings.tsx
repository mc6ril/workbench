"use client";

import React, { useCallback, useMemo } from "react";

import Button from "@/shared/design-system/Button";
import Card from "@/shared/design-system/Card";
import Stack from "@/shared/design-system/Stack";
import Text from "@/shared/design-system/Text";
import Title from "@/shared/design-system/Title";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import StatusColumnRow from "./components/StatusColumnRow";
import styles from "./StatusesColumnsSettings.module.scss";
import type {
  MoveDirection,
  StatusColumnItem,
} from "./StatusesColumnsSettings.types";
import {
  moveStatusColumn,
  renameStatusColumn,
  toggleStatusColumnEnabled,
} from "./StatusesColumnsSettings.utils";

export type { StatusColumnItem } from "./StatusesColumnsSettings.types";

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
      onChange(toggleStatusColumnEnabled(columns, id));
    },
    [columns, onChange]
  );

  const handleRename = useCallback(
    (id: string, name: string): void => {
      onChange(renameStatusColumn(columns, id, name));
    },
    [columns, onChange]
  );

  const handleMove = useCallback(
    (id: string, direction: MoveDirection): void => {
      const updated = moveStatusColumn(columns, id, direction);
      if (!updated) {
        return;
      }
      onChange(updated);
    },
    [columns, onChange]
  );
  const hasColumns = columns.length > 0;
  const enabledLabel = t("fields.enabled.label");
  const nameLabel = t("fields.name.label");
  const namePlaceholder = t("fields.name.placeholder");
  const moveUpLabel = t("actions.moveUp");
  const moveDownLabel = t("actions.moveDown");

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

        {!hasColumns ? (
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
              return (
                <StatusColumnRow
                  key={column.id}
                  column={column}
                  index={index}
                  total={columns.length}
                  isSaving={isSaving}
                  enabledLabel={enabledLabel}
                  enabledAriaLabel={t("fields.enabled.ariaLabel", {
                    name: column.name,
                  })}
                  nameLabel={nameLabel}
                  namePlaceholder={namePlaceholder}
                  nameAriaLabel={t("fields.name.ariaLabel", {
                    name: column.name,
                  })}
                  moveUpLabel={moveUpLabel}
                  moveUpAriaLabel={t("actions.moveUpAriaLabel", {
                    name: column.name,
                  })}
                  moveDownLabel={moveDownLabel}
                  moveDownAriaLabel={t("actions.moveDownAriaLabel", {
                    name: column.name,
                  })}
                  onToggleEnabled={handleToggleEnabled}
                  onRename={handleRename}
                  onMove={handleMove}
                />
              );
            })}
          </Stack>
        )}
      </Card>
    </section>
  );
};

export default React.memo(StatusesColumnsSettings);
