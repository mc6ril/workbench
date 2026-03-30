import Avatar from "@/shared/design-system/avatar";

import type { ProjectMember } from "@/domains/project/core/domain/project.types";
import styles from "@/modules/board/presentation/components/ticket/assigneePicker/AssigneePicker.module.scss";

type AssigneePickerDropdownProps = {
  members: ProjectMember[];
  memberListAriaLabel: string;
  assignedUserIds: Set<string>;
  isDisabled?: boolean;
  onToggle: (userId: string) => Promise<void> | void;
};

const AssigneePickerDropdown = ({
  members,
  memberListAriaLabel,
  assignedUserIds,
  isDisabled = false,
  onToggle,
}: AssigneePickerDropdownProps) => {
  return (
    <div
      className={styles["assignee-picker__dropdown"]}
      role="listbox"
      aria-label={memberListAriaLabel}
    >
      {members.map((member) => {
        const isAssigned = assignedUserIds.has(member.userId);
        const optionClasses = [
          styles["assignee-picker__option"],
          isAssigned && styles["assignee-picker__option--selected"],
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={member.userId}
            className={optionClasses}
            onClick={() => {
              void onToggle(member.userId);
            }}
            disabled={isDisabled}
            role="option"
            aria-selected={isAssigned}
            type="button"
          >
            <Avatar
              src={member.profile.avatarUrl}
              name={member.profile.displayName}
              size="sm"
            />
            <span className={styles["assignee-picker__name"]}>
              {member.profile.displayName || member.profile.email}
            </span>
            {isAssigned && (
              <span className={styles["assignee-picker__check"]} aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AssigneePickerDropdown;
