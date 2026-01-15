"use client";

import React, { useCallback, useMemo } from "react";

import { Button, Card, Input, Stack, Text, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./PrioritiesSettings.module.scss";

export type PriorityItem = {
  id: string;
  name: string;
};

type Props = {
  priorities: PriorityItem[];
  isSaving?: boolean;
  errorMessage?: string | null;
  onChange: (priorities: PriorityItem[]) => void;
  onCreate?: () => void;
  className?: string;
};

const PrioritiesSettings = ({
  priorities,
  isSaving = false,
  errorMessage,
  onChange,
  onCreate,
  className,
}: Props) => {
  const t = useTranslation("pages.settings.priorities");

  const sectionId = useMemo(() => getAccessibilityId("settings-priorities"), []);
  const titleId = `${sectionId}-title`;

  const containerClasses = [styles["priorities-settings"], className]
    .filter(Boolean)
    .join(" ");

  const handleRename = useCallback(
    (id: string, name: string): void => {
      const updated = priorities.map((priority) =>
        priority.id === id ? { ...priority, name } : priority
      );
      onChange(updated);
    },
    [onChange, priorities]
  );

  const handleMove = useCallback(
    (id: string, direction: "up" | "down"): void => {
      const index = priorities.findIndex((priority) => priority.id === id);
      if (index === -1) {
        return;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= priorities.length) {
        return;
      }

      const updated = [...priorities];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      onChange(updated);
    },
    [onChange, priorities]
  );

  return (
    <section
      className={containerClasses}
      aria-labelledby={titleId}
      aria-busy={isSaving ? "true" : undefined}
    >
      <Card className={styles["priorities-settings__card"]}>
        <header className={styles["priorities-settings__header"]}>
          <div className={styles["priorities-settings__header-text"]}>
            <Title id={titleId} variant="h2" className={styles["priorities-settings__title"]}>
              {t("title")}
            </Title>
            <Text as="p" variant="caption" className={styles["priorities-settings__subtitle"]}>
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
            className={styles["priorities-settings__status"]}
            role="alert"
            aria-live="assertive"
          >
            <Text as="p" variant="body" className={styles["priorities-settings__status-error"]}>
              {errorMessage}
            </Text>
          </div>
        )}

        {priorities.length === 0 ? (
          <div className={styles["priorities-settings__empty"]} role="status" aria-live="polite">
            <Text as="p" variant="body" className={styles["priorities-settings__empty-title"]}>
              {t("empty.title")}
            </Text>
            <Text as="p" variant="caption" className={styles["priorities-settings__empty-message"]}>
              {t("empty.message")}
            </Text>
          </div>
        ) : (
          <Stack
            as="ul"
            direction="vertical"
            spacing="xs"
            className={styles["priorities-settings__list"]}
            aria-label={t("listAriaLabel")}
          >
            {priorities.map((priority, index) => {
              const canMoveUp = index > 0;
              const canMoveDown = index < priorities.length - 1;
              const itemId = getAccessibilityId(`settings-priority-${priority.id}`);

              return (
                <li key={priority.id} className={styles["priorities-settings__item"]}>
                  <div className={styles["priorities-settings__item-main"]}>
                    <Input
                      id={`${itemId}-name`}
                      label={t("fields.name.label")}
                      value={priority.name}
                      placeholder={t("fields.name.placeholder")}
                      onChange={(e) => handleRename(priority.id, e.target.value)}
                      disabled={isSaving}
                      aria-label={t("fields.name.ariaLabel", { name: priority.name })}
                    />
                  </div>
                  <div className={styles["priorities-settings__item-actions"]}>
                    <Button
                      label={t("actions.moveUp")}
                      onClick={() => handleMove(priority.id, "up")}
                      variant="ghost"
                      disabled={!canMoveUp || isSaving}
                      aria-label={t("actions.moveUpAriaLabel", { name: priority.name })}
                    />
                    <Button
                      label={t("actions.moveDown")}
                      onClick={() => handleMove(priority.id, "down")}
                      variant="ghost"
                      disabled={!canMoveDown || isSaving}
                      aria-label={t("actions.moveDownAriaLabel", { name: priority.name })}
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

export default React.memo(PrioritiesSettings);

