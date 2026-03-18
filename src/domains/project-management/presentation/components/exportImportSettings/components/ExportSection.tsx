import Button from "@/shared/design-system/Button";
import Text from "@/shared/design-system/Text";
import Title from "@/shared/design-system/Title";

import styles from "@/domains/project-management/presentation/components/exportImportSettings/ExportImportSettings.module.scss";

type ExportSectionProps = {
  title: string;
  hint: string;
  actionLabel: string;
  isBusy: boolean;
  onExport?: () => void;
};

const ExportSection = ({
  title,
  hint,
  actionLabel,
  isBusy,
  onExport,
}: ExportSectionProps) => {
  return (
    <section className={styles["export-import-settings__section"]}>
      <Title variant="h3" className={styles["export-import-settings__section-title"]}>
        {title}
      </Title>
      <Text as="p" variant="caption" className={styles["export-import-settings__section-hint"]}>
        {hint}
      </Text>
      {onExport && (
        <Button
          label={actionLabel}
          onClick={onExport}
          variant="primary"
          disabled={isBusy}
        />
      )}
    </section>
  );
};

export default ExportSection;
