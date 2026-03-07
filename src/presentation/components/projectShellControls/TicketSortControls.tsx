import type { TicketSort } from "@/core/domain/schema/ticket.schema";

import Button from "@/presentation/components/ui/Button";
import Select from "@/presentation/components/ui/Select";

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
  const t = useTranslation("navigation.navbar");

  return (
    <div className={styles["project-shell-controls"]}>
      <Select
        label={t("ticketSortFieldLabel")}
        value={sort.field}
        onChange={(event) => {
          onSetField(event.target.value as TicketSort["field"]);
        }}
        options={[
          {
            value: TICKET_SORT_FIELD_VALUES.CREATED_AT,
            label: t("ticketSortCreatedAt"),
          },
          { value: TICKET_SORT_FIELD_VALUES.TITLE, label: t("ticketSortTitle") },
          {
            value: TICKET_SORT_FIELD_VALUES.POSITION,
            label: t("ticketSortPosition"),
          },
          {
            value: TICKET_SORT_FIELD_VALUES.PRIORITY,
            label: t("ticketSortPriority"),
          },
          {
            value: TICKET_SORT_FIELD_VALUES.DUE_DATE,
            label: t("ticketSortDueDate"),
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
          { value: SORT_DIRECTION_VALUES.ASC, label: t("sortDirectionAsc") },
          { value: SORT_DIRECTION_VALUES.DESC, label: t("sortDirectionDesc") },
        ]}
      />
      <Button
        label={t("resetTicketSort")}
        onClick={onResetSort}
        variant="secondary"
      />
    </div>
  );
};

export default TicketSortControls;
