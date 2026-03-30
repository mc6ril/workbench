import Avatar from "@/shared/design-system/avatar";
import Button from "@/shared/design-system/button";

import type { ProjectMember } from "@/domains/project/core/domain/project.types";
import type { TicketAssignee } from "@/modules/board/core/domain/ticket.types";
import styles from "@/modules/board/presentation/components/ticket/assigneePicker/AssigneePicker.module.scss";
import { resolveAssigneeIdentity } from "@/modules/board/utils/assigneeUtils";

type AssigneePickerCurrentProps = {
  members: ProjectMember[];
  assignees: TicketAssignee[];
  noAssigneeLabel: string;
  assignLabel: string;
  assignAriaLabel: string;
  disabled?: boolean;
  isLoading?: boolean;
  onToggleOpen: () => void;
};

const AssigneePickerCurrent = ({
  members,
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
          {assignees.map((assignee) => {
            const assigneeIdentity = resolveAssigneeIdentity(assignee, members);

            return (
              <Avatar
                key={assignee.userId}
                src={assigneeIdentity.avatarUrl}
                name={assigneeIdentity.displayName}
                size="sm"
              />
            );
          })}
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
