import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./AssigneePicker.module.scss";
import AssigneePickerCurrent from "./components/AssigneePickerCurrent";
import AssigneePickerDropdown from "./components/AssigneePickerDropdown";

import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { TicketAssignee } from "@/modules/board/core/domain/schema/ticket.schema";

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

      try {
        if (assignedUserIds.has(userId)) {
          await onUnassign(userId);
        } else {
          await onAssign(userId);
        }
        // Close after selection to avoid requiring an extra click.
        setIsOpen(false);
      } catch {
        // Keep dropdown open so user can retry after a failed mutation.
      }
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
      <AssigneePickerCurrent
        assignees={assignees}
        noAssigneeLabel={t("noAssignee")}
        assignLabel={t("assign")}
        assignAriaLabel={t("assignAriaLabel")}
        disabled={disabled}
        isLoading={isLoading}
        onToggleOpen={handleToggleOpen}
      />

      {isOpen && (
        <AssigneePickerDropdown
          members={members}
          memberListAriaLabel={t("memberListAriaLabel")}
          assignedUserIds={assignedUserIds}
          isDisabled={disabled || isLoading}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
};

export default React.memo(AssigneePicker);
