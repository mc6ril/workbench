import type { TicketSort } from "@/domains/project-management/core/domain/schema/ticket.schema";

import Button from "@/shared/design-system/Button";
import Select from "@/shared/design-system/Select";

import {
  SORT_DIRECTION_VALUES,
  TICKET_SORT_FIELD_VALUES,
} from "@/shared/constants/filterSort";
import { useTranslation } from "@/shared/i18n";

import styles from "./ProjectShellControls.module.scss";
import type { TicketSortControlsProps } from "./types";

const TicketSortControls = ({
  sort,
  onSetField,
  onSetDirection,
  onResetSort,
}: TicketSortControlsProps) => {
  const t = useTranslation("pages.board.sort");

  return (
    <div className={styles["project-shell-controls"]}>
      <Select
        label={t("label")}
        value={sort.field}
        onChange={(event) => {
          onSetField(event.target.value as TicketSort["field"]);
        }}
        options={[
          {
            value: TICKET_SORT_FIELD_VALUES.CREATED_AT,
            label: t("fieldCreatedAt"),
          },
          {
            value: TICKET_SORT_FIELD_VALUES.TITLE,
            label: t("fieldTitle"),
          },
          {
            value: TICKET_SORT_FIELD_VALUES.POSITION,
            label: t("fieldPosition"),
          },
          {
            value: TICKET_SORT_FIELD_VALUES.PRIORITY,
            label: t("fieldPriority"),
          },
          {
            value: TICKET_SORT_FIELD_VALUES.SPRINT,
            label: t("fieldSprint"),
          },
          {
            value: TICKET_SORT_FIELD_VALUES.DUE_DATE,
            label: t("fieldDueDate"),
          },
        ]}
      />
      <Select
        label={t("sortDirectionLabel")}
        value={sort.direction}
        onChange={(event) => {
          onSetDirection(event.target.value as TicketSort["direction"]);
        }}
        options={[
          { value: SORT_DIRECTION_VALUES.ASC, label: t("directionAsc") },
          { value: SORT_DIRECTION_VALUES.DESC, label: t("directionDesc") },
        ]}
      />
      <Button
        label={t("resetLabel")}
        onClick={onResetSort}
        variant="secondary"
      />
    </div>
  );
};

export default TicketSortControls;
