import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import Select from "@/shared/design-system/select";
import { useTranslation } from "@/shared/i18n";

import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import {
  TICKET_PRIORITY_VALUES,
  type TicketAssignee,
  type TicketPriority,
} from "@/modules/board/core/domain/schema/ticket.schema";
import AssigneePicker from "@/modules/board/presentation/components/ticket/assigneePicker/AssigneePicker";
import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";
import TicketPriorityDot from "@/modules/board/presentation/components/ticket/ticketShared/TicketPriorityDot";
import type { TicketDetailStatusOption } from "@/modules/board/presentation/hooks/ticket/useTicketDetailController";

type Props = {
  canEditTicket: boolean;
  canDeleteTicket: boolean;
  effectiveStatus: string;
  effectivePriority: TicketPriority | "";
  statusOptions: TicketDetailStatusOption[];
  projectMembers: ProjectMember[];
  assignees: TicketAssignee[];
  isUpdatingAssignees: boolean;
  isSavingMainFields: boolean;
  isDeletingTicket: boolean;
  canSaveMainFields: boolean;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: TicketPriority | "") => void;
  onAssign: (userId: string) => void;
  onUnassign: (userId: string) => void;
  onSaveMainFields: () => void;
  onOpenDeleteModal: () => void;
};

const TicketDetailSidebarCard = ({
  canEditTicket,
  canDeleteTicket,
  effectiveStatus,
  effectivePriority,
  statusOptions,
  projectMembers,
  assignees,
  isUpdatingAssignees,
  isSavingMainFields,
  isDeletingTicket,
  canSaveMainFields,
  onStatusChange,
  onPriorityChange,
  onAssign,
  onUnassign,
  onSaveMainFields,
  onOpenDeleteModal,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.page");
  const prioritySummary = effectivePriority
    ? t(`priority.${effectivePriority}`)
    : t("fields.none");

  return (
    <Card className={styles["ticket-detail__aside"]}>
      <Select
        label={t("fields.status")}
        value={effectiveStatus}
        options={statusOptions}
        disabled={!canEditTicket}
        onChange={(event) => {
          onStatusChange(event.target.value);
        }}
      />

      <div className={styles["ticket-detail__field"]}>
        <span className={styles["ticket-detail__field-label"]}>
          {t("fields.priority")}
        </span>
        <div
          className={styles["ticket-detail__priority-selector"]}
          role="group"
          aria-label={t("fields.priority")}
        >
          {TICKET_PRIORITY_VALUES.map((value) => {
            const isSelected = effectivePriority === value;

            return (
              <button
                key={value}
                type="button"
                className={[
                  styles["ticket-detail__priority-button"],
                  isSelected &&
                    styles["ticket-detail__priority-button--selected"],
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  onPriorityChange(isSelected ? "" : value);
                }}
                disabled={!canEditTicket}
                aria-label={t(`priority.${value}`)}
                aria-pressed={isSelected}
                title={t(`priority.${value}`)}
              >
                <TicketPriorityDot priority={value} size="lg" />
              </button>
            );
          })}
          <span className={styles["ticket-detail__priority-summary"]}>
            {prioritySummary}
          </span>
        </div>
      </div>

      <AssigneePicker
        members={projectMembers}
        assignees={assignees}
        onAssign={onAssign}
        onUnassign={onUnassign}
        disabled={!canEditTicket}
        isLoading={isUpdatingAssignees}
      />

      <div className={styles["ticket-detail__actions"]}>
        <Button
          label={t("actions.save")}
          variant="save"
          fullWidth
          onClick={onSaveMainFields}
          disabled={!canSaveMainFields || isSavingMainFields}
        />
        {canDeleteTicket ? (
          <Button
            label={t("actions.delete")}
            variant="saveDanger"
            fullWidth
            onClick={onOpenDeleteModal}
            disabled={isDeletingTicket}
          />
        ) : null}
      </div>
    </Card>
  );
};

export default TicketDetailSidebarCard;
