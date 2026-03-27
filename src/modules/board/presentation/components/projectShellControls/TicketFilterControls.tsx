import Button from "@/shared/design-system/button";
import Select from "@/shared/design-system/select";
import { useTranslation } from "@/shared/i18n";

import styles from "./ProjectShellControls.module.scss";
import type { TicketFilterControlsProps } from "./types";

const TicketFilterControls = ({
  filters,
  statusOptions,
  onSetStatus,
  onClearStatus,
  onResetFilters,
}: TicketFilterControlsProps) => {
  const t = useTranslation("pages.board.filters");

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
      <Button
        label={t("resetLabel")}
        onClick={onResetFilters}
        variant="secondary"
      />
    </div>
  );
};

export default TicketFilterControls;
