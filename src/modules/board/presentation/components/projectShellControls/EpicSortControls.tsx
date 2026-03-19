import type { EpicSortField } from "@/modules/board/core/domain/types";

import {
  EPIC_SORT_FIELD_VALUES,
  SORT_DIRECTION_VALUES,
} from "@/shared/constants/filterSort";
import Button from "@/shared/design-system/Button";
import Select from "@/shared/design-system/Select";
import { useTranslation } from "@/shared/i18n";
import type { SortDirection } from "@/shared/types";

import styles from "./ProjectShellControls.module.scss";
import type { EpicSortControlsProps } from "./types";

const EpicSortControls = ({
  epicSortField,
  epicSortDirection,
  onSetField,
  onSetDirection,
  onReset,
}: EpicSortControlsProps) => {
  const t = useTranslation("navigation.navbar");

  return (
    <div className={styles["project-shell-controls"]}>
      <Select
        label={t("epicSortFieldLabel")}
        value={epicSortField}
        onChange={(event) => {
          onSetField(event.target.value as EpicSortField);
        }}
        options={[
          {
            value: EPIC_SORT_FIELD_VALUES.UPDATED_AT,
            label: t("epicSortUpdatedAt"),
          },
          {
            value: EPIC_SORT_FIELD_VALUES.CREATED_AT,
            label: t("epicSortCreatedAt"),
          },
          { value: EPIC_SORT_FIELD_VALUES.NAME, label: t("epicSortName") },
          {
            value: EPIC_SORT_FIELD_VALUES.PROGRESS,
            label: t("epicSortProgress"),
          },
        ]}
      />
      <Select
        label={t("sortDirectionLabel")}
        value={epicSortDirection}
        onChange={(event) => {
          onSetDirection(event.target.value as SortDirection);
        }}
        options={[
          { value: SORT_DIRECTION_VALUES.ASC, label: t("sortDirectionAsc") },
          { value: SORT_DIRECTION_VALUES.DESC, label: t("sortDirectionDesc") },
        ]}
      />
      <Button
        label={t("resetEpicSort")}
        onClick={onReset}
        variant="secondary"
      />
    </div>
  );
};

export default EpicSortControls;
