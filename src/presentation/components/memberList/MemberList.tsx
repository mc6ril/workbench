import React, { useCallback } from "react";

import type { ProjectRole } from "@/core/domain/schema/project.schema";
import type { ProjectMember } from "@/core/domain/schema/projectMember.schema";

import Avatar from "@/presentation/components/ui/Avatar";
import Badge from "@/presentation/components/ui/Badge";
import Button from "@/presentation/components/ui/Button";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./MemberList.module.scss";

type Props = {
  /** List of project members to display */
  members: ProjectMember[];
  /** Current user's ID (to prevent self-removal) */
  currentUserId: string;
  /** Whether the current user is an admin */
  isAdmin: boolean;
  /** Whether advanced roles feature is available (Team plan) */
  hasAdvancedRoles?: boolean;
  /** Called when admin changes a member's role */
  onRoleChange?: (memberId: string, role: ProjectRole) => void;
  /** Called when admin removes a member */
  onRemove?: (memberId: string) => void;
  /** Whether a mutation is in progress */
  isLoading?: boolean;
};

/**
 * Displays a list of project members with their avatar, name, email, and role.
 * Admins can change roles and remove members (except themselves and the last admin).
 */
const MemberList = ({
  members,
  currentUserId,
  isAdmin,
  hasAdvancedRoles = false,
  onRoleChange,
  onRemove,
  isLoading = false,
}: Props) => {
  const t = useTranslation("pages.members");
  const listId = getAccessibilityId("member-list");

  const handleRemove = useCallback(
    (memberId: string) => {
      if (onRemove) {
        onRemove(memberId);
      }
    },
    [onRemove]
  );

  return (
    <div
      id={listId}
      className={styles["member-list"]}
      role="list"
      aria-label={t("listAriaLabel")}
    >
      {members.map((member) => {
        const isSelf = member.userId === currentUserId;
        const canModify = isAdmin && !isSelf;

        return (
          <div
            key={member.id}
            className={styles["member-list__item"]}
            role="listitem"
          >
            <div className={styles["member-list__info"]}>
              <Avatar
                src={member.profile.avatarUrl}
                name={member.profile.displayName}
                size="md"
              />
              <div className={styles["member-list__details"]}>
                <span className={styles["member-list__name"]}>
                  {member.profile.displayName || member.profile.email}
                  {isSelf && (
                    <span className={styles["member-list__you"]}>
                      {" "}
                      ({t("you")})
                    </span>
                  )}
                </span>
                <span className={styles["member-list__email"]}>
                  {member.profile.email}
                </span>
              </div>
            </div>

            <div className={styles["member-list__actions"]}>
              <Badge label={t(`role.${member.role}`)} />

              {canModify && hasAdvancedRoles && onRoleChange && (
                <select
                  className={styles["member-list__role-select"]}
                  value={member.role}
                  onChange={(e) =>
                    onRoleChange(member.id, e.target.value as ProjectRole)
                  }
                  disabled={isLoading}
                  aria-label={t("changeRoleAriaLabel", {
                    name: member.profile.displayName || member.profile.email,
                  })}
                >
                  <option value="admin">{t("role.admin")}</option>
                  <option value="member">{t("role.member")}</option>
                  <option value="viewer">{t("role.viewer")}</option>
                </select>
              )}

              {canModify && (
                <Button
                  label={t("remove")}
                  onClick={() => handleRemove(member.id)}
                  variant="ghost"
                  disabled={isLoading}
                  aria-label={t("removeAriaLabel", {
                    name: member.profile.displayName || member.profile.email,
                  })}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(MemberList);
