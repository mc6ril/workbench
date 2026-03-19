"use client";

import React, { useMemo } from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Card from "@/shared/design-system/card";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import ExportSection from "./components/ExportSection";
import ImportSection from "./components/ImportSection";
import LiveRegionMessage from "./components/LiveRegionMessage";
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

  const baseId = useMemo(
    () => getAccessibilityId("settings-export-import"),
    []
  );
  const titleId = `${baseId}-title`;
  const liveRegionId = `${baseId}-live-region`;
  const fileInputId = `${baseId}-file-input`;

  const containerClasses = [styles["export-import-settings"], className]
    .filter(Boolean)
    .join(" ");

  const isBusy = isExporting || isImporting;
  const liveMessage = errorMessage || statusMessage || "";
  const hasLiveMessage = Boolean(liveMessage);

  return (
    <section
      className={containerClasses}
      aria-labelledby={titleId}
      aria-describedby={hasLiveMessage ? liveRegionId : undefined}
      aria-busy={isBusy ? "true" : undefined}
    >
      <Card className={styles["export-import-settings__card"]}>
        <header className={styles["export-import-settings__header"]}>
          <div className={styles["export-import-settings__header-text"]}>
            <Title
              id={titleId}
              variant="h2"
              className={styles["export-import-settings__title"]}
            >
              {t("title")}
            </Title>
            <Text
              as="p"
              variant="caption"
              className={styles["export-import-settings__subtitle"]}
            >
              {t("subtitle")}
            </Text>
          </div>
        </header>
        <LiveRegionMessage
          id={liveRegionId}
          message={liveMessage}
          isError={Boolean(errorMessage)}
        />

        <div className={styles["export-import-settings__sections"]}>
          <ExportSection
            title={t("export.title")}
            hint={t("export.hint")}
            actionLabel={
              isExporting ? t("export.exporting") : t("export.action")
            }
            isBusy={isBusy}
            onExport={onExport}
          />
          <ImportSection
            fileInputId={fileInputId}
            title={t("import.title")}
            hint={t("import.hint")}
            fileLabel={t("import.fileLabel")}
            accept={t("import.accept")}
            fileAriaLabel={t("import.fileAriaLabel")}
            fileHint={t("import.fileHint")}
            importingLabel={t("import.importing")}
            isBusy={isBusy}
            isImporting={isImporting}
            onImportFile={onImportFile}
          />
        </div>
      </Card>
    </section>
  );
};

export default React.memo(ExportImportSettings);
