import type { TicketPriority } from "@/domains/project-management/core/domain/schema/ticket.schema";

import Button from "@/shared/design-system/Button";
import Select from "@/shared/design-system/Select";
import Text from "@/shared/design-system/Text";

import { useTranslation } from "@/shared/i18n";

import styles from "./ProjectShellControls.module.scss";
import type { TicketFilterControlsProps } from "./types";

const TicketFilterControls = ({
  filters,
  statusOptions,
  epicOptions,
  sprintOptions,
  labelOptions,
  onSetStatus,
  onClearStatus,
  onSetEpicId,
  onClearEpicId,
  onSetSprintId,
  onClearSprintId,
  onSetPriority,
  onClearPriority,
  onSetLabelIds,
  onClearLabelIds,
  onResetFilters,
}: TicketFilterControlsProps) => {
  const t = useTranslation("pages.board.filters");
  const tTicket = useTranslation("pages.ticketDetail.page");

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
      <Select
        label={t("priorityLabel")}
        value={filters.priority ?? ""}
        onChange={(event) => {
          const nextPriority = event.target.value as TicketPriority | "";
          if (nextPriority) {
            onSetPriority(nextPriority);
            return;
          }
          onClearPriority();
        }}
        options={[
          { value: "", label: "" },
          { value: "highest", label: tTicket("priority.highest") },
          { value: "high", label: tTicket("priority.high") },
          { value: "medium", label: tTicket("priority.medium") },
          { value: "low", label: tTicket("priority.low") },
          { value: "lowest", label: tTicket("priority.lowest") },
        ]}
      />
      <Select
        label={t("sprintLabel")}
        value={
          filters.sprintId === null ? "__no_sprint__" : (filters.sprintId ?? "")
        }
        onChange={(event) => {
          const nextSprintId = event.target.value;
          if (!nextSprintId) {
            onClearSprintId();
            return;
          }

          if (nextSprintId === "__no_sprint__") {
            onSetSprintId(null);
            return;
          }

          onSetSprintId(nextSprintId);
        }}
        options={[
          { value: "", label: "" },
          { value: "__no_sprint__", label: t("noSprintLabel") },
          ...sprintOptions,
        ]}
      />
      {labelOptions.length > 0 && (
        <Select
          label={t("labelLabel")}
          value={filters.labelIds ?? []}
          multiple
          size={Math.min(6, Math.max(4, labelOptions.length))}
          onChange={(event) => {
            const nextLabelIds = Array.from(
              event.target.selectedOptions,
              (option) => option.value
            ).filter(Boolean);
            if (nextLabelIds.length > 0) {
              onSetLabelIds(nextLabelIds);
              return;
            }
            onClearLabelIds();
          }}
          options={labelOptions}
        />
      )}
      {labelOptions.length === 0 && (
        <Text variant="caption">{t("noLabelOptions")}</Text>
      )}
      <Button
        label={t("resetLabel")}
        onClick={onResetFilters}
        variant="secondary"
      />
    </div>
  );
};

export default TicketFilterControls;
