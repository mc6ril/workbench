import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ProjectMember } from "@/core/domain/schema/projectMember.schema";
import type { TicketAssignee } from "@/core/domain/schema/ticket.schema";

import Avatar from "@/presentation/components/ui/Avatar";
import Button from "@/presentation/components/ui/Button";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./AssigneePicker.module.scss";

type Props = {
  /** All members of the project (available for assignment) */
  members: ProjectMember[];
  /** Currently assigned users */
  assignees: TicketAssignee[];
  /** Called when a user is assigned */
  onAssign: (userId: string) => Promise<void> | void;
  /** Called when a user is unassigned */
  onUnassign: (userId: string) => Promise<void> | void;
  /** Whether mutations are in progress */
  isLoading?: boolean;
  /** Disable assignment interactions (read-only mode) */
  disabled?: boolean;
};

/**
 * Multi-select dropdown for assigning project members to a ticket.
 * Shows a list of project members with checkmarks for assigned ones.
 */
const AssigneePicker = ({
  members,
  assignees,
  onAssign,
  onUnassign,
  isLoading = false,
  disabled = false,
}: Props) => {
  const t = useTranslation("ui.assigneePicker");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pickerId = getAccessibilityId("assignee-picker");

  const assignedUserIds = useMemo(
    () => new Set(assignees.map((a) => a.userId)),
    [assignees]
  );

  const handleToggle = useCallback(
    async (userId: string) => {
      if (disabled) {
        return;
      }

      if (assignedUserIds.has(userId)) {
        await onUnassign(userId);
      } else {
        await onAssign(userId);
      }
      // Close after selection to avoid requiring an extra click.
      setIsOpen(false);
    },
    [assignedUserIds, disabled, onAssign, onUnassign]
  );

  const handleToggleOpen = useCallback(() => {
    if (disabled) {
      return;
    }

    setIsOpen((prev) => !prev);
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div
      id={pickerId}
      ref={containerRef}
      className={styles["assignee-picker"]}
      role="group"
      aria-label={t("ariaLabel")}
    >
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
          <span className={styles["assignee-picker__empty"]}>
            {t("noAssignee")}
          </span>
        )}

        <Button
          label={t("assign")}
          onClick={handleToggleOpen}
          variant="ghost"
          disabled={disabled || isLoading}
          aria-label={t("assignAriaLabel")}
        />
      </div>

      {isOpen && (
        <div
          className={styles["assignee-picker__dropdown"]}
          role="listbox"
          aria-label={t("memberListAriaLabel")}
        >
          {members.map((member) => {
            const isAssigned = assignedUserIds.has(member.userId);
            return (
              <button
                key={member.userId}
                className={`${styles["assignee-picker__option"]} ${
                  isAssigned ? styles["assignee-picker__option--selected"] : ""
                }`}
                onClick={() => handleToggle(member.userId)}
                disabled={disabled || isLoading}
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
                  <span
                    className={styles["assignee-picker__check"]}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(AssigneePicker);
