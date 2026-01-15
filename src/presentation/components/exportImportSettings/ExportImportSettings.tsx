"use client";

import React, { useCallback, useMemo } from "react";

import { Button, Card, Text, Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./ExportImportSettings.module.scss";

type Props = {
  isExporting?: boolean;
  isImporting?: boolean;
  statusMessage?: string | null;
  errorMessage?: string | null;
  onExport?: () => void;
  onImportFile?: (file: File) => void;
  className?: string;
};

const ExportImportSettings = ({
  isExporting = false,
  isImporting = false,
  statusMessage,
  errorMessage,
  onExport,
  onImportFile,
  className,
}: Props) => {
  const t = useTranslation("pages.settings.exportImport");

  const baseId = useMemo(() => getAccessibilityId("settings-export-import"), []);
  const titleId = `${baseId}-title`;
  const liveRegionId = `${baseId}-live-region`;
  const fileInputId = `${baseId}-file-input`;

  const containerClasses = [styles["export-import-settings"], className]
    .filter(Boolean)
    .join(" ");

  const isBusy = isExporting || isImporting;

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      if (!onImportFile) {
        return;
      }

      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      onImportFile(file);
      event.target.value = "";
    },
    [onImportFile]
  );

  const liveMessage = errorMessage || statusMessage || "";

  return (
    <section
      className={containerClasses}
      aria-labelledby={titleId}
      aria-describedby={liveMessage ? liveRegionId : undefined}
      aria-busy={isBusy ? "true" : undefined}
    >
      <Card className={styles["export-import-settings__card"]}>
        <header className={styles["export-import-settings__header"]}>
          <div className={styles["export-import-settings__header-text"]}>
            <Title id={titleId} variant="h2" className={styles["export-import-settings__title"]}>
              {t("title")}
            </Title>
            <Text as="p" variant="caption" className={styles["export-import-settings__subtitle"]}>
              {t("subtitle")}
            </Text>
          </div>
        </header>

        <div
          id={liveRegionId}
          className={styles["export-import-settings__live-region"]}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveMessage && (
            <Text
              as="p"
              variant="body"
              className={
                errorMessage
                  ? styles["export-import-settings__message-error"]
                  : styles["export-import-settings__message"]
              }
            >
              {liveMessage}
            </Text>
          )}
        </div>

        <div className={styles["export-import-settings__sections"]}>
          <section className={styles["export-import-settings__section"]}>
            <Title variant="h3" className={styles["export-import-settings__section-title"]}>
              {t("export.title")}
            </Title>
            <Text as="p" variant="caption" className={styles["export-import-settings__section-hint"]}>
              {t("export.hint")}
            </Text>
            {onExport && (
              <Button
                label={isExporting ? t("export.exporting") : t("export.action")}
                onClick={onExport}
                variant="primary"
                disabled={isBusy}
              />
            )}
          </section>

          <section className={styles["export-import-settings__section"]}>
            <Title variant="h3" className={styles["export-import-settings__section-title"]}>
              {t("import.title")}
            </Title>
            <Text as="p" variant="caption" className={styles["export-import-settings__section-hint"]}>
              {t("import.hint")}
            </Text>

            {onImportFile && (
              <div className={styles["export-import-settings__import-controls"]}>
                <label
                  htmlFor={fileInputId}
                  className={styles["export-import-settings__file-label"]}
                >
                  {t("import.fileLabel")}
                </label>
                <input
                  id={fileInputId}
                  type="file"
                  accept={t("import.accept")}
                  onChange={handleFileChange}
                  disabled={isBusy}
                  aria-label={t("import.fileAriaLabel")}
                  className={styles["export-import-settings__file-input"]}
                />
                <Text as="p" variant="caption" className={styles["export-import-settings__file-hint"]}>
                  {t("import.fileHint")}
                </Text>
              </div>
            )}

            {isImporting && (
              <Text as="p" variant="body" className={styles["export-import-settings__message"]}>
                {t("import.importing")}
              </Text>
            )}
          </section>
        </div>
      </Card>
    </section>
  );
};

export default React.memo(ExportImportSettings);

