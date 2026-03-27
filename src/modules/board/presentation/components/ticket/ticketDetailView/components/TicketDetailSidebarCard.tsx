import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import Select from "@/shared/design-system/select";
import { useTranslation } from "@/shared/i18n";

import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { TicketAssignee } from "@/modules/board/core/domain/schema/ticket.schema";
import AssigneePicker from "@/modules/board/presentation/components/ticket/assigneePicker/AssigneePicker";
import styles from "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";
import type { TicketDetailStatusOption } from "@/modules/board/presentation/hooks/ticket/useTicketDetailController";

type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  canEditTicket: boolean;
  canDeleteTicket: boolean;
  effectiveStatus: string;
  effectivePriority: string;
  statusOptions: TicketDetailStatusOption[];
  priorityOptions: SelectOption[];
  projectMembers: ProjectMember[];
  assignees: TicketAssignee[];
  isUpdatingAssignees: boolean;
  isSavingMainFields: boolean;
  isDeletingTicket: boolean;
  canSaveMainFields: boolean;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
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
  priorityOptions,
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

      <Select
        label={t("fields.priority")}
        value={effectivePriority}
        options={priorityOptions}
        disabled={!canEditTicket}
        onChange={(event) => {
          onPriorityChange(event.target.value);
        }}
      />

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
