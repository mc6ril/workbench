"use client";

import React, { useCallback, useMemo } from "react";

import Button from "@/presentation/components/ui/Button";
import Card from "@/presentation/components/ui/Card";
import Stack from "@/presentation/components/ui/Stack";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import PriorityRow from "./components/PriorityRow";
import styles from "./PrioritiesSettings.module.scss";
import type {
  MoveDirection,
  PriorityItem,
} from "./PrioritiesSettings.types";
import {
  movePriority,
  renamePriority,
} from "./PrioritiesSettings.utils";

export type { PriorityItem } from "./PrioritiesSettings.types";

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

  const sectionId = useMemo(
    () => getAccessibilityId("settings-priorities"),
    []
  );
  const titleId = `${sectionId}-title`;

  const containerClasses = [styles["priorities-settings"], className]
    .filter(Boolean)
    .join(" ");

  const handleRename = useCallback(
    (id: string, name: string): void => {
      onChange(renamePriority(priorities, id, name));
    },
    [onChange, priorities]
  );

  const handleMove = useCallback(
    (id: string, direction: MoveDirection): void => {
      const updated = movePriority(priorities, id, direction);
      if (!updated) {
        return;
      }

      onChange(updated);
    },
    [onChange, priorities]
  );
  const hasPriorities = priorities.length > 0;
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
      <Card className={styles["priorities-settings__card"]}>
        <header className={styles["priorities-settings__header"]}>
          <div className={styles["priorities-settings__header-text"]}>
            <Title
              id={titleId}
              variant="h2"
              className={styles["priorities-settings__title"]}
            >
              {t("title")}
            </Title>
            <Text
              as="p"
              variant="caption"
              className={styles["priorities-settings__subtitle"]}
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
            className={styles["priorities-settings__status"]}
            role="alert"
            aria-live="assertive"
          >
            <Text
              as="p"
              variant="body"
              className={styles["priorities-settings__status-error"]}
            >
              {errorMessage}
            </Text>
          </div>
        )}

        {!hasPriorities ? (
          <div
            className={styles["priorities-settings__empty"]}
            role="status"
            aria-live="polite"
          >
            <Text
              as="p"
              variant="body"
              className={styles["priorities-settings__empty-title"]}
            >
              {t("empty.title")}
            </Text>
            <Text
              as="p"
              variant="caption"
              className={styles["priorities-settings__empty-message"]}
            >
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
              return (
                <PriorityRow
                  key={priority.id}
                  priority={priority}
                  index={index}
                  total={priorities.length}
                  isSaving={isSaving}
                  nameLabel={nameLabel}
                  namePlaceholder={namePlaceholder}
                  nameAriaLabel={t("fields.name.ariaLabel", {
                    name: priority.name,
                  })}
                  moveUpLabel={moveUpLabel}
                  moveDownLabel={moveDownLabel}
                  moveUpAriaLabel={t("actions.moveUpAriaLabel", {
                    name: priority.name,
                  })}
                  moveDownAriaLabel={t("actions.moveDownAriaLabel", {
                    name: priority.name,
                  })}
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

export default React.memo(PrioritiesSettings);
