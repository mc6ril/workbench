import type { TicketAssignee } from "@/modules/board/core/domain/schema/ticket.schema";

import Avatar from "@/shared/design-system/Avatar";
import Button from "@/shared/design-system/Button";

import styles from "@/modules/board/presentation/components/ticket/assigneePicker/AssigneePicker.module.scss";

type AssigneePickerCurrentProps = {
  assignees: TicketAssignee[];
  noAssigneeLabel: string;
  assignLabel: string;
  assignAriaLabel: string;
  disabled?: boolean;
  isLoading?: boolean;
  onToggleOpen: () => void;
};

const AssigneePickerCurrent = ({
  assignees,
  noAssigneeLabel,
  assignLabel,
  assignAriaLabel,
  disabled = false,
  isLoading = false,
  onToggleOpen,
}: AssigneePickerCurrentProps) => {
  return (
    <div className={styles["assignee-picker__current"]}>
      {assignees.length > 0 ? (
        <div className={styles["assignee-picker__avatars"]}>
          {assignees.map((assignee) => (
            <Avatar
              key={assignee.userId}
              src={assignee.avatarUrl}
              name={assignee.displayName}
              size="sm"
            />
          ))}
        </div>
      ) : (
        <span className={styles["assignee-picker__empty"]}>{noAssigneeLabel}</span>
      )}

      <Button
        label={assignLabel}
        onClick={onToggleOpen}
        variant="ghost"
        disabled={disabled || isLoading}
        aria-label={assignAriaLabel}
      />
    </div>
  );
};

export default AssigneePickerCurrent;
