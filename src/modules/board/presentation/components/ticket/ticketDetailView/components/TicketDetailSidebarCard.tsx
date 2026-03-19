import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import Select from "@/shared/design-system/select";
import Text from "@/shared/design-system/text";
import { useTranslation } from "@/shared/i18n";

import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { Label } from "@/modules/board/core/domain/schema/label.schema";
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
  hasEpicsAccess: boolean;
  effectiveStatus: string;
  effectivePriority: string;
  effectiveEpicId: string;
  effectiveSprintId: string;
  statusOptions: TicketDetailStatusOption[];
  priorityOptions: SelectOption[];
  epicOptions: SelectOption[];
  sprintOptions: SelectOption[];
  labels: Label[];
  assignedLabelIdSet: Set<string>;
  projectMembers: ProjectMember[];
  assignees: TicketAssignee[];
  isUpdatingAssignees: boolean;
  isSavingMainFields: boolean;
  isDeletingTicket: boolean;
  canSaveMainFields: boolean;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onEpicChange: (value: string) => void;
  onSprintChange: (value: string) => void;
  onToggleLabel: (labelId: string) => void;
  onAssign: (userId: string) => void;
  onUnassign: (userId: string) => void;
  onSaveMainFields: () => void;
  onOpenDeleteModal: () => void;
};

const TicketDetailSidebarCard = ({
  canEditTicket,
  canDeleteTicket,
  hasEpicsAccess,
  effectiveStatus,
  effectivePriority,
  effectiveEpicId,
  effectiveSprintId,
  statusOptions,
  priorityOptions,
  epicOptions,
  sprintOptions,
  labels,
  assignedLabelIdSet,
  projectMembers,
  assignees,
  isUpdatingAssignees,
  isSavingMainFields,
  isDeletingTicket,
  canSaveMainFields,
  onStatusChange,
  onPriorityChange,
  onEpicChange,
  onSprintChange,
  onToggleLabel,
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

      {hasEpicsAccess ? (
        <Select
          label={t("fields.epic")}
          value={effectiveEpicId}
          options={epicOptions}
          disabled={!canEditTicket}
          onChange={(event) => {
            onEpicChange(event.target.value);
          }}
        />
      ) : null}

      <Select
        label={t("fields.sprint")}
        value={effectiveSprintId}
        options={sprintOptions}
        disabled={!canEditTicket}
        onChange={(event) => {
          onSprintChange(event.target.value);
        }}
      />

      <div className={styles["ticket-detail__labels"]}>
        <Text variant="caption">{t("fields.labels")}</Text>
        <div className={styles["ticket-detail__label-list"]}>
          {labels.map((label) => {
            const isSelected = assignedLabelIdSet.has(label.id);
            return (
              <button
                key={label.id}
                type="button"
                className={`${styles["ticket-detail__label-chip"]} ${
                  isSelected ? styles["ticket-detail__label-chip--active"] : ""
                }`}
                disabled={!canEditTicket}
                onClick={() => {
                  onToggleLabel(label.id);
                }}
              >
                {label.name}
              </button>
            );
          })}
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
