"use client";

import React, { useMemo } from "react";

import { Button, Card, Input, Stack, Text, Textarea, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./ProjectSettings.module.scss";

type Props = {
  projectName: string;
  projectDescription?: string | null;
  isSaving?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  onProjectNameChange: (value: string) => void;
  onProjectDescriptionChange: (value: string) => void;
  onSave?: () => void;
  onReset?: () => void;
  className?: string;
};

const ProjectSettings = ({
  projectName,
  projectDescription,
  isSaving = false,
  errorMessage,
  successMessage,
  onProjectNameChange,
  onProjectDescriptionChange,
  onSave,
  onReset,
  className,
}: Props) => {
  const t = useTranslation("pages.settings.project");

  const baseId = useMemo(() => getAccessibilityId("project-settings"), []);
  const titleId = `${baseId}-title`;
  const statusId = `${baseId}-status`;

  const containerClasses = [styles["project-settings"], className]
    .filter(Boolean)
    .join(" ");

  const hasStatus = Boolean(errorMessage) || Boolean(successMessage);

  return (
    <section
      className={containerClasses}
      aria-labelledby={titleId}
      aria-describedby={hasStatus ? statusId : undefined}
      aria-busy={isSaving ? "true" : undefined}
    >
      <Card className={styles["project-settings__card"]}>
        <header className={styles["project-settings__header"]}>
          <div className={styles["project-settings__header-text"]}>
            <Title id={titleId} variant="h2" className={styles["project-settings__title"]}>
              {t("title")}
            </Title>
            <Text as="p" variant="caption" className={styles["project-settings__subtitle"]}>
              {t("subtitle")}
            </Text>
          </div>
        </header>

        {hasStatus && (
          <div
            id={statusId}
            role="status"
            aria-live="polite"
            className={styles["project-settings__status"]}
          >
            {errorMessage && (
              <Text as="p" variant="body" className={styles["project-settings__status-error"]}>
                {errorMessage}
              </Text>
            )}
            {!errorMessage && successMessage && (
              <Text as="p" variant="body" className={styles["project-settings__status-success"]}>
                {successMessage}
              </Text>
            )}
          </div>
        )}

        <Stack as="div" direction="vertical" spacing="md">
          <Input
            label={t("fields.projectName.label")}
            placeholder={t("fields.projectName.placeholder")}
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            disabled={isSaving}
          />

          <Textarea
            label={t("fields.projectDescription.label")}
            placeholder={t("fields.projectDescription.placeholder")}
            value={projectDescription ?? ""}
            onChange={(e) => onProjectDescriptionChange(e.target.value)}
            disabled={isSaving}
            rows={5}
          />
        </Stack>

        <div className={styles["project-settings__actions"]}>
          {onReset && (
            <Button
              label={t("actions.reset")}
              onClick={onReset}
              variant="secondary"
              disabled={isSaving}
            />
          )}
          {onSave && (
            <Button
              label={isSaving ? t("actions.saving") : t("actions.save")}
              onClick={onSave}
              variant="primary"
              disabled={isSaving}
            />
          )}
        </div>
      </Card>
    </section>
  );
};

export default React.memo(ProjectSettings);

