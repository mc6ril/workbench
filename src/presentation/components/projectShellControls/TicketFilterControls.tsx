import Button from "@/presentation/components/ui/Button";
import Select from "@/presentation/components/ui/Select";

import { useTranslation } from "@/shared/i18n";

import styles from "./ProjectShellControls.module.scss";
import type { TicketFilterControlsProps } from "./types";

const TicketFilterControls = ({
  filters,
  statusOptions,
  epicOptions,
  onSetStatus,
  onClearStatus,
  onSetEpicId,
  onClearEpicId,
  onResetFilters,
}: TicketFilterControlsProps) => {
  const t = useTranslation("pages.backlog.filters");

  return (
    <div className={styles["project-shell-controls"]}>
      <Select
        label={t("statusLabel")}
        value={filters.status ?? ""}
        onChange={(event) => {
          const nextStatus = event.target.value;
          if (nextStatus) {
            onSetStatus(nextStatus);
            return;
          }
          onClearStatus();
        }}
        options={[{ value: "", label: "" }, ...statusOptions]}
      />
      <Select
        label={t("epicLabel")}
        value={filters.epicId ?? ""}
        onChange={(event) => {
          const nextEpicId = event.target.value;
          if (nextEpicId) {
            onSetEpicId(nextEpicId);
            return;
          }
          onClearEpicId();
        }}
        options={[{ value: "", label: "" }, ...epicOptions]}
      />
      <Button
        label={t("resetLabel")}
        onClick={onResetFilters}
        variant="secondary"
      />
    </div>
  );
};

export default TicketFilterControls;
