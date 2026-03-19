import { EPIC_PROGRESS_FILTER_VALUES } from "@/shared/constants/filterSort";
import type { EpicProgressFilter } from "@/domains/project-management/core/domain/types";
import Button from "@/shared/design-system/Button";
import Select from "@/shared/design-system/Select";
import { useTranslation } from "@/shared/i18n";

import styles from "./ProjectShellControls.module.scss";
import type { EpicFilterControlsProps } from "./types";

const EpicFilterControls = ({
  epicProgressFilter,
  onChange,
  onReset,
}: EpicFilterControlsProps) => {
  const t = useTranslation("navigation.navbar");

  return (
    <div className={styles["project-shell-controls"]}>
      <Select
        label={t("epicFilterLabel")}
        value={epicProgressFilter}
        onChange={(event) => {
          onChange(event.target.value as EpicProgressFilter);
        }}
        options={[
          { value: EPIC_PROGRESS_FILTER_VALUES.ALL, label: t("epicFilterAll") },
          {
            value: EPIC_PROGRESS_FILTER_VALUES.NOT_STARTED,
            label: t("epicFilterNotStarted"),
          },
          {
            value: EPIC_PROGRESS_FILTER_VALUES.IN_PROGRESS,
            label: t("epicFilterInProgress"),
          },
          {
            value: EPIC_PROGRESS_FILTER_VALUES.COMPLETED,
            label: t("epicFilterCompleted"),
          },
        ]}
      />
      <Button
        label={t("resetEpicFilters")}
        onClick={onReset}
        variant="secondary"
      />
    </div>
  );
};

export default EpicFilterControls;
