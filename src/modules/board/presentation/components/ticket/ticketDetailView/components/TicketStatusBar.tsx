import { useTranslations } from "@/shared/i18n";

import TicketDetailInlinePopover from "./TicketDetailInlinePopover";

import {
  TICKET_PRIORITY_VALUES,
  type TicketPriority,
} from "@/modules/board/core/domain/ticket.types";
import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";
import TicketPriorityDot from "@/modules/board/presentation/components/ticket/ticketShared/TicketPriorityDot";
import type { TicketDetailStatusOption } from "@/modules/board/presentation/hooks/ticket/useTicketDetailController";

type Props = {
  canEditTicket: boolean;
  effectiveColumnId: string;
  effectivePriority: TicketPriority | "";
  statusOptions: TicketDetailStatusOption[];
  onColumnChange: (value: string) => void;
  onPriorityChange: (value: TicketPriority | "") => void;
};

const getStatusChipClassName = (
  state: TicketDetailStatusOption["state"] | undefined
): string | null => {
  if (state === "todo") {
    return styles["ticket-detail__chip--todo"];
  }

  if (state === "in_progress") {
    return styles["ticket-detail__chip--doing"];
  }

  if (state === "done") {
    return styles["ticket-detail__chip--done"];
  }

  return null;
};

const getPriorityChipClassName = (
  priority: TicketPriority | ""
): string | null => {
  if (priority === "urgent")
    return styles["ticket-detail__chip--priority-urgent"];
  if (priority === "normal")
    return styles["ticket-detail__chip--priority-normal"];
  if (priority === "low") return styles["ticket-detail__chip--priority-low"];
  return null;
};

const TicketStatusBar = ({
  canEditTicket,
  effectiveColumnId,
  effectivePriority,
  statusOptions,
  onColumnChange,
  onPriorityChange,
}: Props) => {
  const t = useTranslations("pages.ticketDetail.page");

  const selectedStatus =
    statusOptions.find((option) => option.value === effectiveColumnId) ?? null;

  return (
    <div className={styles["ticket-detail__status-bar"]}>
      <TicketDetailInlinePopover
        panelAriaLabel={t("fields.status")}
        disabled={!canEditTicket}
        renderTrigger={({ buttonProps }) => (
          <button
            {...buttonProps}
            className={[
              styles["ticket-detail__chip"],
              getStatusChipClassName(selectedStatus?.state),
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles["ticket-detail__chip-label"]}>
              {t("fields.status")}
            </span>
            <span
              className={styles["ticket-detail__chip-dot"]}
              aria-hidden="true"
            />
            <span>{selectedStatus?.label ?? t("fields.none")}</span>
          </button>
        )}
      >
        {({ close }) => (
          <div className={styles["ticket-detail__popover-list"]}>
            {statusOptions.map((option) => {
              const isSelected = option.value === effectiveColumnId;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={[
                    styles["ticket-detail__popover-option"],
                    isSelected &&
                      styles["ticket-detail__popover-option--selected"],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    onColumnChange(option.value);
                    close();
                  }}
                >
                  <span
                    className={[
                      styles["ticket-detail__popover-dot"],
                      option.state === "todo" &&
                        styles["ticket-detail__popover-dot--todo"],
                      option.state === "in_progress" &&
                        styles["ticket-detail__popover-dot--doing"],
                      option.state === "done" &&
                        styles["ticket-detail__popover-dot--done"],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden="true"
                  />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </TicketDetailInlinePopover>

      <TicketDetailInlinePopover
        panelAriaLabel={t("fields.priority")}
        disabled={!canEditTicket}
        renderTrigger={({ buttonProps }) => (
          <button
            {...buttonProps}
            className={[
              styles["ticket-detail__chip"],
              getPriorityChipClassName(effectivePriority),
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles["ticket-detail__chip-label"]}>
              {t("fields.priority")}
            </span>
            {effectivePriority ? (
              <TicketPriorityDot priority={effectivePriority} size="sm" />
            ) : (
              <span
                className={styles["ticket-detail__chip-dot"]}
                aria-hidden="true"
              />
            )}
            <span>
              {effectivePriority
                ? t(`priority.${effectivePriority}`)
                : t("fields.none")}
            </span>
          </button>
        )}
      >
        {({ close }) => (
          <div className={styles["ticket-detail__popover-list"]}>
            <button
              type="button"
              className={[
                styles["ticket-detail__popover-option"],
                effectivePriority === "" &&
                  styles["ticket-detail__popover-option--selected"],
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                onPriorityChange("");
                close();
              }}
            >
              <span
                className={styles["ticket-detail__popover-dot"]}
                aria-hidden="true"
              />
              <span>{t("fields.none")}</span>
            </button>

            {TICKET_PRIORITY_VALUES.map((priority) => {
              const isSelected = priority === effectivePriority;

              return (
                <button
                  key={priority}
                  type="button"
                  className={[
                    styles["ticket-detail__popover-option"],
                    isSelected &&
                      styles["ticket-detail__popover-option--selected"],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    onPriorityChange(priority);
                    close();
                  }}
                >
                  <TicketPriorityDot priority={priority} size="sm" />
                  <span>{t(`priority.${priority}`)}</span>
                </button>
              );
            })}
          </div>
        )}
      </TicketDetailInlinePopover>
    </div>
  );
};

export default TicketStatusBar;
