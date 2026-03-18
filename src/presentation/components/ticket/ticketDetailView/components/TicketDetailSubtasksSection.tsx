import type { Ticket } from "@/core/domain/schema/ticket.schema";

import CreateSubtaskForm from "@/presentation/components/ticket/createSubtaskForm/CreateSubtaskForm";
import SubtasksList from "@/presentation/components/ticket/subtasksList/SubtasksList";
import styles from "@/presentation/components/ticket/ticketDetailView/TicketDetailView.module.scss";
import Button from "@/shared/design-system/Button";

import { useTranslation } from "@/shared/i18n";

type Props = {
  subtasks: Ticket[];
  doneStatuses: Set<string>;
  canEditTicket: boolean;
  canDeleteTicket: boolean;
  isSubtaskFormOpen: boolean;
  isCreatingSubtask: boolean;
  createSubtaskErrorMessage?: string;
  onToggleSubtaskCompleted: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onOpenSubtaskForm: () => void;
  onCloseSubtaskForm: () => void;
  onCreateSubtask: (values: { title: string; description?: string }) => void;
};

const TicketDetailSubtasksSection = ({
  subtasks,
  doneStatuses,
  canEditTicket,
  canDeleteTicket,
  isSubtaskFormOpen,
  isCreatingSubtask,
  createSubtaskErrorMessage,
  onToggleSubtaskCompleted,
  onDeleteSubtask,
  onOpenSubtaskForm,
  onCloseSubtaskForm,
  onCreateSubtask,
}: Props) => {
  const t = useTranslation("pages.ticketDetail.page");

  return (
    <section className={styles["ticket-detail__subtasks"]}>
      <SubtasksList
        subtasks={subtasks.map((subtask) => ({
          id: subtask.id,
          title: subtask.title,
          isCompleted: doneStatuses.has(subtask.status),
        }))}
        onToggleCompleted={canEditTicket ? onToggleSubtaskCompleted : undefined}
        onDelete={canDeleteTicket ? onDeleteSubtask : undefined}
        emptyStateAction={
          canEditTicket ? (
            <Button
              label={t("subtasks.addButton")}
              variant="secondary"
              onClick={onOpenSubtaskForm}
            />
          ) : undefined
        }
      />
      {canEditTicket && isSubtaskFormOpen ? (
        <CreateSubtaskForm
          onSubmit={onCreateSubtask}
          onCancel={onCloseSubtaskForm}
          isSubmitting={isCreatingSubtask}
          errorMessage={createSubtaskErrorMessage}
        />
      ) : null}
    </section>
  );
};

export default TicketDetailSubtasksSection;
