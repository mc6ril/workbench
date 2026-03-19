import { type ChangeEvent, useCallback } from "react";

import Text from "@/shared/design-system/Text";
import Title from "@/shared/design-system/Title";

import styles from "@/modules/board/presentation/components/exportImportSettings/ExportImportSettings.module.scss";

type ImportSectionProps = {
  fileInputId: string;
  title: string;
  hint: string;
  fileLabel: string;
  accept: string;
  fileAriaLabel: string;
  fileHint: string;
  importingLabel: string;
  isBusy: boolean;
  isImporting: boolean;
  onImportFile?: (file: File) => void;
};

const ImportSection = ({
  fileInputId,
  title,
  hint,
  fileLabel,
  accept,
  fileAriaLabel,
  fileHint,
  importingLabel,
  isBusy,
  isImporting,
  onImportFile,
}: ImportSectionProps) => {
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
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

  return (
    <section className={styles["export-import-settings__section"]}>
      <Title variant="h3" className={styles["export-import-settings__section-title"]}>
        {title}
      </Title>
      <Text as="p" variant="caption" className={styles["export-import-settings__section-hint"]}>
        {hint}
      </Text>

      {onImportFile && (
        <div className={styles["export-import-settings__import-controls"]}>
          <label
            htmlFor={fileInputId}
            className={styles["export-import-settings__file-label"]}
          >
            {fileLabel}
          </label>
          <input
            id={fileInputId}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isBusy}
            aria-label={fileAriaLabel}
            className={styles["export-import-settings__file-input"]}
          />
          <Text as="p" variant="caption" className={styles["export-import-settings__file-hint"]}>
            {fileHint}
          </Text>
        </div>
      )}

      {isImporting && (
        <Text as="p" variant="body" className={styles["export-import-settings__message"]}>
          {importingLabel}
        </Text>
      )}
    </section>
  );
};

export default ImportSection;
