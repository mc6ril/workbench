"use client";

import { useCallback, useState } from "react";

import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";

import Avatar from "@/shared/design-system/Avatar";
import Button from "@/shared/design-system/Button";
import ErrorMessage from "@/shared/design-system/ErrorMessage";
import Loader from "@/shared/design-system/Loader";
import Modal from "@/shared/design-system/Modal";
import { useToastStore } from "@/shared/design-system/stores/useToastStore";
import Text from "@/shared/design-system/Text";
import { getRoleLabelKey, useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import styles from "./ProjectMembersModal.module.scss";

import { useSession } from "@/domains/auth/presentation/hooks/useSession";
import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { useRemoveMember } from "@/domains/project/presentation/hooks/member/useRemoveMember";
import { useUpdateMemberRole } from "@/domains/project/presentation/hooks/member/useUpdateMemberRole";
import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

type ProjectMembersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
};

const MANAGEABLE_ROLES = Object.freeze([
  ProjectRole.VIEWER,
  ProjectRole.MEMBER,
  ProjectRole.ADMIN,
]);

const getMemberDisplayName = (member: ProjectMember): string => {
  return member.profile.displayName?.trim() || member.profile.email;
};

const getMemberEmail = (member: ProjectMember): string | null => {
  return member.profile.displayName?.trim() ? member.profile.email : null;
};

const ProjectMembersModal = ({
  isOpen,
  onClose,
  projectId,
  projectName,
}: ProjectMembersModalProps) => {
  const { data: session } = useSession();
  const { data: members = [], isLoading, error, refetch, isFetching } =
    useProjectMembers(projectId);
  const updateMemberRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const addToast = useToastStore((state) => state.addToast);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const tWorkspace = useTranslation("pages.workspace");
  const tMembers = useTranslation("pages.members");
  const tErrors = useTranslation("errors");

  const actionError =
    updateMemberRoleMutation.error ?? removeMemberMutation.error ?? null;
  const actionErrorMessage = getErrorMessage(
    actionError as { code?: string } | null,
    tErrors
  );

  const adminCount = members.filter(
    (member) => member.role === ProjectRole.ADMIN
  ).length;

  const handleRoleChange = useCallback(
    async (member: ProjectMember, nextRole: ProjectRole) => {
      if (member.role === nextRole) {
        return;
      }

      setUpdatingMemberId(member.id);
      updateMemberRoleMutation.reset();

      try {
        await updateMemberRoleMutation.mutateAsync({
          memberId: member.id,
          role: nextRole,
          projectId,
        });

        addToast({
          message: tMembers("roleUpdateSuccess"),
          variant: "success",
          duration: 4000,
        });

        if (
          member.userId === session?.userId &&
          nextRole !== ProjectRole.ADMIN
        ) {
          onClose();
        }
      } catch {
        // Error is rendered in the modal.
      } finally {
        setUpdatingMemberId(null);
      }
    },
    [addToast, onClose, projectId, session?.userId, tMembers, updateMemberRoleMutation]
  );

  const handleRemoveMember = useCallback(
    async (member: ProjectMember) => {
      const memberName = getMemberDisplayName(member);
      const confirmed = window.confirm(
        tMembers("removeConfirm", { name: memberName })
      );

      if (!confirmed) {
        return;
      }

      setRemovingMemberId(member.id);
      removeMemberMutation.reset();

      try {
        await removeMemberMutation.mutateAsync({
          memberId: member.id,
          projectId,
        });

        addToast({
          message: tMembers("removeSuccess"),
          variant: "success",
          duration: 4000,
        });

        if (member.userId === session?.userId) {
          onClose();
        }
      } catch {
        // Error is rendered in the modal.
      } finally {
        setRemovingMemberId(null);
      }
    },
    [addToast, onClose, projectId, removeMemberMutation, session?.userId, tMembers]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tWorkspace("actions.membersModalTitle")}
      size="large"
    >
      <div className={styles["project-members-modal"]}>
        <section className={styles["project-members-modal__hero"]}>
          <div className={styles["project-members-modal__eyebrow"]}>
            {tWorkspace("actions.membersHeroEyebrow")}
          </div>
          <div className={styles["project-members-modal__project-name"]}>
            {projectName}
          </div>
          <Text
            variant="small"
            className={styles["project-members-modal__description"]}
          >
            {tWorkspace("actions.membersModalDescription", {
              name: projectName,
            })}
          </Text>

          <div className={styles["project-members-modal__pills"]}>
            <span className={styles["project-members-modal__pill"]}>
              {tWorkspace("membersCount", { count: members.length })}
            </span>
            <span className={styles["project-members-modal__pill"]}>
              {tWorkspace("actions.membersAdminsCount", { count: adminCount })}
            </span>
            <span
              className={`${styles["project-members-modal__pill"]} ${
                isFetching
                  ? styles["project-members-modal__pill--muted"]
                  : styles["project-members-modal__pill--accent"]
              }`}
            >
              {isFetching
                ? tWorkspace("actions.membersSyncing")
                : tWorkspace("actions.membersLive")}
            </span>
          </div>
        </section>

        {actionError && <ErrorMessage message={actionErrorMessage} />}

        <section className={styles["project-members-modal__panel"]}>
          <div className={styles["project-members-modal__section-header"]}>
            <div className={styles["project-members-modal__section-title"]}>
              {tWorkspace("actions.membersSectionTitle")}
            </div>
            <Text
              variant="small"
              className={styles["project-members-modal__section-description"]}
            >
              {tWorkspace("actions.membersSectionDescription")}
            </Text>
          </div>

          {isLoading ? (
            <div className={styles["project-members-modal__loading"]}>
              <Loader
                variant="inline"
                message={tWorkspace("actions.membersLoading")}
                ariaLabel={tWorkspace("actions.membersLoadingAriaLabel")}
              />
            </div>
          ) : error ? (
            <div className={styles["project-members-modal__empty"]}>
              <div className={styles["project-members-modal__empty-title"]}>
                {tWorkspace("actions.membersUnavailableTitle")}
              </div>
              <Text
                variant="small"
                className={styles["project-members-modal__empty-description"]}
              >
                {tWorkspace("actions.membersUnavailableDescription")}
              </Text>
              <Button
                label={tErrors("retry")}
                variant="secondary"
                onClick={() => {
                  void refetch();
                }}
                aria-label={tErrors("retryAriaLabel")}
              />
            </div>
          ) : members.length === 0 ? (
            <div className={styles["project-members-modal__empty"]}>
              <div className={styles["project-members-modal__empty-title"]}>
                {tMembers("emptyState")}
              </div>
              <Text
                variant="small"
                className={styles["project-members-modal__empty-description"]}
              >
                {tWorkspace("actions.membersEmptyDescription")}
              </Text>
            </div>
          ) : (
            <div
              className={styles["project-members-modal__list"]}
              role="list"
              aria-label={tMembers("listAriaLabel")}
            >
              {members.map((member) => {
                const displayName = getMemberDisplayName(member);
                const email = getMemberEmail(member);
                const isCurrentUser = member.userId === session?.userId;
                const isUpdating = updatingMemberId === member.id;
                const isRemoving = removingMemberId === member.id;
                const isBusy = isUpdating || isRemoving;

                return (
                  <article
                    key={member.id}
                    className={`${styles["project-members-modal__item"]} ${
                      isBusy ? styles["project-members-modal__item--busy"] : ""
                    }`}
                    role="listitem"
                  >
                    <div className={styles["project-members-modal__identity"]}>
                      <Avatar
                        src={member.profile.avatarUrl}
                        name={displayName}
                        size="md"
                      />

                      <div className={styles["project-members-modal__identity-copy"]}>
                        <div className={styles["project-members-modal__name-row"]}>
                          <span className={styles["project-members-modal__name"]}>
                            {displayName}
                          </span>
                          <span
                            className={`${styles["project-members-modal__tag"]} ${
                              styles[
                                `project-members-modal__tag--${member.role}`
                              ]
                            }`}
                          >
                            {tWorkspace(getRoleLabelKey(member.role))}
                          </span>
                          {isCurrentUser && (
                            <span
                              className={`${styles["project-members-modal__tag"]} ${styles["project-members-modal__tag--current"]}`}
                            >
                              {tMembers("you")}
                            </span>
                          )}
                        </div>

                        {email && (
                          <div className={styles["project-members-modal__email"]}>
                            {email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles["project-members-modal__controls"]}>
                      <label className={styles["project-members-modal__role-field"]}>
                        <span
                          className={styles["project-members-modal__role-label"]}
                        >
                          {tWorkspace("actions.membersRoleLabel")}
                        </span>
                        <select
                          className={styles["project-members-modal__role-select"]}
                          value={member.role}
                          disabled={isBusy}
                          aria-label={tMembers("changeRoleAriaLabel", {
                            name: displayName,
                          })}
                          onChange={(event) => {
                            void handleRoleChange(
                              member,
                              event.target.value as ProjectRole
                            );
                          }}
                        >
                          {MANAGEABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {tWorkspace(getRoleLabelKey(role))}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className={styles["project-members-modal__remove"]}
                        disabled={isBusy}
                        aria-label={tMembers("removeAriaLabel", {
                          name: displayName,
                        })}
                        onClick={() => {
                          void handleRemoveMember(member);
                        }}
                      >
                        {tMembers("remove")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className={styles["project-members-modal__footer"]}>
          <Button
            label={tWorkspace("actions.membersModalClose")}
            variant="secondary"
            onClick={onClose}
            aria-label={tWorkspace("actions.membersModalCloseAriaLabel")}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProjectMembersModal;
