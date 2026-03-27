"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import Avatar from "@/shared/design-system/avatar";
import Button from "@/shared/design-system/button";
import Card from "@/shared/design-system/card";
import ErrorMessage from "@/shared/design-system/error_message";
import Input from "@/shared/design-system/input";
import Loader from "@/shared/design-system/loader";
import Modal from "@/shared/design-system/modal";
import Select from "@/shared/design-system/select";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { getRoleLabelKey, useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { useToastStore } from "@/shared/stores/useToastStore";

import styles from "./projectPeopleSettingsSection.module.scss";

import { PlanFeature } from "@/domains/billing/core/domain/planFeatures.rules";
import { useFeatureAccess } from "@/domains/billing/presentation/hooks/useFeatureAccess";
import {
  InvitationStatus,
  type ProjectInvitation,
} from "@/domains/project/core/domain/schema/invitation.schema";
import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";
import {
  DEFAULT_INVITE_ROLE,
  INVITE_ROLE_DESCRIPTION_KEYS,
} from "@/domains/project/presentation/components/inviteProjectModal/InviteProjectModal.constants";
import { useInviteMember } from "@/domains/project/presentation/hooks/invitation/useInviteMember";
import { useProjectInvitations } from "@/domains/project/presentation/hooks/invitation/useProjectInvitations";
import { useRevokeInvitation } from "@/domains/project/presentation/hooks/invitation/useRevokeInvitation";
import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { useRemoveMember } from "@/domains/project/presentation/hooks/member/useRemoveMember";
import { useUpdateMemberRole } from "@/domains/project/presentation/hooks/member/useUpdateMemberRole";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions";
import { buildInvitationRoute } from "@/domains/project/utils/invitationUtils";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

type ProjectPeopleSettingsSectionProps = {
  projectId: string;
};

const MANAGEABLE_ROLES = Object.freeze([
  ProjectRole.MEMBER,
  ProjectRole.ADMIN,
]);

const getMemberDisplayName = (member: ProjectMember): string => {
  return member.profile.displayName?.trim() || member.profile.email;
};

const getMemberEmail = (member: ProjectMember): string | null => {
  return member.profile.displayName?.trim() ? member.profile.email : null;
};

const isActiveInvitation = (invitation: ProjectInvitation): boolean => {
  return (
    invitation.status === InvitationStatus.PENDING &&
    invitation.expiresAt.getTime() > Date.now()
  );
};

const ProjectPeopleSettingsSection = ({
  projectId,
}: ProjectPeopleSettingsSectionProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { canManageMembers } = useProjectPermissions();
  const {
    data: members = [],
    isLoading: isMembersLoading,
    isFetching: isMembersFetching,
    error: membersError,
    refetch: refetchMembers,
  } = useProjectMembers(projectId);
  const {
    data: invitations = [],
    isLoading: isInvitationsLoading,
    isFetching: isInvitationsFetching,
    error: invitationsError,
    refetch: refetchInvitations,
  } = useProjectInvitations(projectId);
  const membersLimitAccess = useFeatureAccess(PlanFeature.MEMBERS_PER_WORKSPACE);
  const advancedRolesAccess = useFeatureAccess(PlanFeature.ADVANCED_ROLES);
  const inviteMutation = useInviteMember();
  const revokeInvitationMutation = useRevokeInvitation();
  const updateMemberRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const addToast = useToastStore((state) => state.addToast);

  const tPeople = useTranslation("pages.settings.people");
  const tMembers = useTranslation("pages.settings.members");
  const tInvitations = useTranslation("pages.settings.invitations");
  const tWorkspace = useTranslation("pages.workspace");
  const tUpgrade = useTranslation("pages.upgrade");
  const tMembersGlobal = useTranslation("pages.members");
  const tErrors = useTranslation("errors");

  const [inviteRole, setInviteRole] =
    useState<ProjectRole>(DEFAULT_INVITE_ROLE);
  const [invitationLink, setInvitationLink] = useState("");
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<ProjectMember | null>(null);
  const [revokingInvitationId, setRevokingInvitationId] = useState<
    string | null
  >(null);
  const [invitationPendingRevoke, setInvitationPendingRevoke] =
    useState<ProjectInvitation | null>(null);

  useEffect(() => {
    if (!advancedRolesAccess.hasAccess && inviteRole === ProjectRole.VIEWER) {
      setInviteRole(DEFAULT_INVITE_ROLE);
      setInvitationLink("");
    }
  }, [advancedRolesAccess.hasAccess, inviteRole]);

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  }, []);
  const currentPlanLabel = tUpgrade(
    `planBadges.${membersLimitAccess.currentPlan}`
  );
  const hasInvitationLink = invitationLink.length > 0;
  const selectedRoleDescription = tWorkspace(
    INVITE_ROLE_DESCRIPTION_KEYS[inviteRole]
  );
  const pendingInvitations = useMemo(() => {
    return invitations.filter(isActiveInvitation);
  }, [invitations]);
  const memberLimit = membersLimitAccess.limit;
  const occupiedSeats = members.length + pendingInvitations.length;
  const hasUnlimitedSeats = memberLimit === undefined;
  const isMemberLimitReached =
    memberLimit !== undefined && occupiedSeats >= memberLimit;
  const adminCount = members.filter(
    (member) => member.role === ProjectRole.ADMIN
  ).length;
  const inviteRoleOptions = useMemo(() => {
    const roles = [...MANAGEABLE_ROLES];

    if (advancedRolesAccess.hasAccess) {
      roles.unshift(ProjectRole.VIEWER);
    }

    return roles.map((role) => ({
      value: role,
      label: tWorkspace(getRoleLabelKey(role)),
    }));
  }, [advancedRolesAccess.hasAccess, tWorkspace]);
  const invitationErrorMessage = invitationsError
    ? getErrorMessage(invitationsError as { code?: string }, tErrors)
    : null;
  const memberErrorMessage = membersError
    ? getErrorMessage(membersError as { code?: string }, tErrors)
    : null;
  const inviteActionErrorMessage = inviteMutation.error
    ? getErrorMessage(inviteMutation.error as { code?: string }, tErrors)
    : null;
  const revokeActionErrorMessage = revokeInvitationMutation.error
    ? getErrorMessage(
        revokeInvitationMutation.error as { code?: string },
        tErrors
      )
    : null;
  const memberActionError =
    updateMemberRoleMutation.error ?? removeMemberMutation.error ?? null;
  const memberActionErrorMessage = getErrorMessage(
    memberActionError as { code?: string } | null,
    tErrors
  );

  const formatDate = useCallback(
    (value: Date) => {
      return dateFormatter.format(value);
    },
    [dateFormatter]
  );

  const handleCreateInvitation = useCallback(async () => {
    if (
      !canManageMembers ||
      membersLimitAccess.isLoading ||
      isMemberLimitReached
    ) {
      return;
    }

    inviteMutation.reset();

    try {
      const invitation = await inviteMutation.mutateAsync({
        input: {
          projectId,
          role: inviteRole,
        },
        currentPlan: membersLimitAccess.currentPlan,
      });

      const nextLink =
        typeof window === "undefined"
          ? buildInvitationRoute(invitation.token)
          : `${window.location.origin}${buildInvitationRoute(invitation.token)}`;

      setInvitationLink(nextLink);
    } catch {
      // Error state is rendered in the section.
    }
  }, [
    canManageMembers,
    inviteMutation,
    inviteRole,
    isMemberLimitReached,
    membersLimitAccess.currentPlan,
    membersLimitAccess.isLoading,
    projectId,
  ]);

  const handleCopyInvitationLink = useCallback(async () => {
    if (!invitationLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationLink);
      addToast({
        message: tInvitations("copyLinkSuccess"),
        variant: "success",
        duration: 4000,
      });
    } catch {
      addToast({
        message: tErrors("generic"),
        variant: "error",
        duration: 4000,
      });
    }
  }, [addToast, invitationLink, tErrors, tInvitations]);

  const handleRoleChange = useCallback(
    async (member: ProjectMember, nextRole: ProjectRole) => {
      if (!canManageMembers || member.role === nextRole) {
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
          message: tMembersGlobal("roleUpdateSuccess"),
          variant: "success",
          duration: 4000,
        });
      } catch {
        // Error state is rendered in the members card.
      } finally {
        setUpdatingMemberId(null);
      }
    },
    [
      addToast,
      canManageMembers,
      projectId,
      tMembersGlobal,
      updateMemberRoleMutation,
    ]
  );

  const handleRemoveMember = useCallback(
    async (member: ProjectMember) => {
      if (!canManageMembers) {
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
          message: tMembersGlobal("removeSuccess"),
          variant: "success",
          duration: 4000,
        });

        if (member.userId === session?.userId) {
          router.replace(PAGE_ROUTES.WORKSPACE);
        }
      } catch {
        // Error state is rendered in the members card.
      } finally {
        setRemovingMemberId(null);
        setMemberPendingRemoval(null);
      }
    },
    [
      addToast,
      canManageMembers,
      projectId,
      removeMemberMutation,
      router,
      session?.userId,
      tMembersGlobal,
    ]
  );

  const handleRevokeInvitation = useCallback(
    async (invitation: ProjectInvitation) => {
      if (!canManageMembers) {
        return;
      }

      setRevokingInvitationId(invitation.id);
      revokeInvitationMutation.reset();

      try {
        await revokeInvitationMutation.mutateAsync({
          invitationId: invitation.id,
          projectId,
        });

        addToast({
          message: tInvitations("revokeSuccess"),
          variant: "success",
          duration: 4000,
        });
      } catch {
        // Error state is rendered in the invitations card.
      } finally {
        setRevokingInvitationId(null);
        setInvitationPendingRevoke(null);
      }
    },
    [
      addToast,
      canManageMembers,
      projectId,
      revokeInvitationMutation,
      tInvitations,
    ]
  );

  const closeRemoveMemberModal = useCallback(() => {
    if (removeMemberMutation.isPending) {
      return;
    }

    removeMemberMutation.reset();
    setMemberPendingRemoval(null);
  }, [removeMemberMutation]);

  const closeRevokeInvitationModal = useCallback(() => {
    if (revokeInvitationMutation.isPending) {
      return;
    }

    revokeInvitationMutation.reset();
    setInvitationPendingRevoke(null);
  }, [revokeInvitationMutation]);

  return (
    <section className={styles["people-settings"]}>
      <div className={styles["people-settings__header"]}>
        <Title variant="h2" className={styles["people-settings__title"]}>
          {tPeople("title")}
        </Title>
        <Text
          variant="caption"
          className={styles["people-settings__subtitle"]}
        >
          {tPeople("subtitle")}
        </Text>
      </div>

      {!canManageMembers && (
        <div
          className={`${styles["people-settings__notice"]} ${styles["people-settings__notice--info"]}`}
        >
          <Text variant="small">{tPeople("adminOnly")}</Text>
        </div>
      )}

      <div className={styles["people-settings__grid"]}>
        <Card className={styles["people-settings__card"]}>
          <div className={styles["people-settings__section-header"]}>
            <Title variant="h3" className={styles["people-settings__section-title"]}>
              {tInvitations("title")}
            </Title>
            <Text
              variant="caption"
              className={styles["people-settings__section-subtitle"]}
            >
              {tInvitations("subtitle")}
            </Text>
          </div>

          <div className={styles["people-settings__pills"]}>
            <span className={styles["people-settings__pill"]}>
              {tInvitations("activeCount", {
                count: pendingInvitations.length,
              })}
            </span>
            <span className={styles["people-settings__pill"]}>
              {hasUnlimitedSeats
                ? tPeople("memberLimit.unlimited", {
                    count: occupiedSeats,
                  })
                : tPeople("memberLimit.limited", {
                    count: occupiedSeats,
                    limit: memberLimit!,
                  })}
            </span>
            <span className={styles["people-settings__pill"]}>
              {tPeople("currentPlan", { plan: currentPlanLabel })}
            </span>
          </div>

          {canManageMembers && !advancedRolesAccess.hasAccess && (
            <div
              className={`${styles["people-settings__notice"]} ${styles["people-settings__notice--info"]}`}
            >
              <Text variant="small">
                {tPeople("advancedRolesLocked", {
                  plan: tUpgrade(
                    `planBadges.${advancedRolesAccess.minimumPlan}`
                  ),
                })}
              </Text>
            </div>
          )}

          {canManageMembers && isMemberLimitReached && (
            <div
              className={`${styles["people-settings__notice"]} ${styles["people-settings__notice--warning"]}`}
            >
              <Text variant="small">
                {tPeople("memberLimit.reached", {
                  limit: memberLimit!,
                  plan: currentPlanLabel,
                })}
              </Text>
            </div>
          )}

          {inviteActionErrorMessage && (
            <ErrorMessage message={inviteActionErrorMessage} />
          )}

          {revokeActionErrorMessage && (
            <ErrorMessage message={revokeActionErrorMessage} />
          )}

          <div className={styles["people-settings__form"]}>
            <div className={styles["people-settings__form-header"]}>
              <Title variant="h3" className={styles["people-settings__block-title"]}>
                {tInvitations("createTitle")}
              </Title>
              <Text
                variant="small"
                className={styles["people-settings__block-subtitle"]}
              >
                {tInvitations("createDescription")}
              </Text>
            </div>

            <Select
              label={tInvitations("roleLabel")}
              aria-label={tInvitations("roleLabel")}
              options={inviteRoleOptions}
              value={inviteRole}
              disabled={
                !canManageMembers ||
                inviteMutation.isPending ||
                membersLimitAccess.isLoading
              }
              helperText={selectedRoleDescription}
              onChange={(event) => {
                setInviteRole(event.target.value as ProjectRole);
                setInvitationLink("");
                inviteMutation.reset();
              }}
            />

            {hasInvitationLink && (
              <Input
                label={tInvitations("linkLabel")}
                aria-label={tInvitations("linkLabel")}
                value={invitationLink}
                helperText={tInvitations("linkHelper")}
                readOnly
              />
            )}

            <div className={styles["people-settings__actions"]}>
              {hasInvitationLink && (
                <Button
                  label={tInvitations("copyLink")}
                  variant="secondary"
                  onClick={handleCopyInvitationLink}
                />
              )}
              <Button
                label={
                  inviteMutation.isPending
                    ? tInvitations("creating")
                    : tInvitations("create")
                }
                onClick={() => void handleCreateInvitation()}
                disabled={
                  !canManageMembers ||
                  inviteMutation.isPending ||
                  membersLimitAccess.isLoading ||
                  isMemberLimitReached
                }
              />
            </div>
          </div>

          <div className={styles["people-settings__divider"]} />

          <div className={styles["people-settings__form-header"]}>
            <Title variant="h3" className={styles["people-settings__block-title"]}>
              {tInvitations("listTitle")}
            </Title>
            <Text
              variant="small"
              className={styles["people-settings__block-subtitle"]}
            >
              {tInvitations("listDescription")}
            </Text>
          </div>

          {isInvitationsLoading ? (
            <div className={styles["people-settings__loading"]}>
              <Loader
                variant="inline"
                message={tInvitations("loading")}
                ariaLabel={tInvitations("loading")}
              />
            </div>
          ) : invitationsError ? (
            <div className={styles["people-settings__empty"]}>
              <div className={styles["people-settings__empty-title"]}>
                {tInvitations("loadErrorTitle")}
              </div>
              <Text
                variant="small"
                className={styles["people-settings__empty-description"]}
              >
                {invitationErrorMessage ?? tErrors("generic")}
              </Text>
              <Button
                label={tErrors("retry")}
                variant="secondary"
                onClick={() => {
                  void refetchInvitations();
                }}
                aria-label={tErrors("retryAriaLabel")}
              />
            </div>
          ) : pendingInvitations.length === 0 ? (
            <div className={styles["people-settings__empty"]}>
              <div className={styles["people-settings__empty-title"]}>
                {tInvitations("emptyTitle")}
              </div>
              <Text
                variant="small"
                className={styles["people-settings__empty-description"]}
              >
                {tInvitations("emptyDescription")}
              </Text>
            </div>
          ) : (
            <div
              className={styles["people-settings__list"]}
              role="list"
              aria-label={tInvitations("listAriaLabel")}
            >
              {pendingInvitations.map((invitation) => {
                const isRevoking = revokingInvitationId === invitation.id;

                return (
                  <article
                    key={invitation.id}
                    className={styles["people-settings__item"]}
                    role="listitem"
                  >
                    <div className={styles["people-settings__item-copy"]}>
                      <div className={styles["people-settings__name-row"]}>
                        <span className={styles["people-settings__name"]}>
                          {tInvitations("pendingLinkTitle")}
                        </span>
                        <span
                          className={`${styles["people-settings__tag"]} ${
                            styles[`people-settings__tag--${invitation.role}`]
                          }`}
                        >
                          {tWorkspace(getRoleLabelKey(invitation.role))}
                        </span>
                        {isInvitationsFetching && (
                          <span
                            className={`${styles["people-settings__tag"]} ${styles["people-settings__tag--muted"]}`}
                          >
                            {tInvitations("syncing")}
                          </span>
                        )}
                      </div>

                      <Text
                        variant="small"
                        className={styles["people-settings__meta"]}
                      >
                        {tInvitations("createdAt", {
                          date: formatDate(invitation.createdAt),
                        })}
                      </Text>
                      <Text
                        variant="small"
                        className={styles["people-settings__meta"]}
                      >
                        {tInvitations("expiresAt", {
                          date: formatDate(invitation.expiresAt),
                        })}
                      </Text>
                    </div>

                    <div className={styles["people-settings__item-actions"]}>
                      <Button
                        label={tInvitations("revoke")}
                        variant="secondary"
                        onClick={() => {
                          revokeInvitationMutation.reset();
                          setInvitationPendingRevoke(invitation);
                        }}
                        disabled={!canManageMembers || isRevoking}
                        aria-label={tInvitations("revokeAriaLabel", {
                          date: formatDate(invitation.expiresAt),
                        })}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>

        <Card className={styles["people-settings__card"]}>
          <div className={styles["people-settings__section-header"]}>
            <Title variant="h3" className={styles["people-settings__section-title"]}>
              {tMembers("title")}
            </Title>
            <Text
              variant="caption"
              className={styles["people-settings__section-subtitle"]}
            >
              {tMembers("subtitle")}
            </Text>
          </div>

          <div className={styles["people-settings__pills"]}>
            <span className={styles["people-settings__pill"]}>
              {tWorkspace("membersCount", { count: members.length })}
            </span>
            <span className={styles["people-settings__pill"]}>
              {tMembers("adminsCount", { count: adminCount })}
            </span>
            <span className={styles["people-settings__pill"]}>
              {isMembersFetching ? tMembers("syncing") : tMembers("live")}
            </span>
          </div>

          {memberActionError && <ErrorMessage message={memberActionErrorMessage} />}

          {isMembersLoading ? (
            <div className={styles["people-settings__loading"]}>
              <Loader
                variant="inline"
                message={tMembers("loading")}
                ariaLabel={tMembers("loading")}
              />
            </div>
          ) : membersError ? (
            <div className={styles["people-settings__empty"]}>
              <div className={styles["people-settings__empty-title"]}>
                {tMembers("loadErrorTitle")}
              </div>
              <Text
                variant="small"
                className={styles["people-settings__empty-description"]}
              >
                {memberErrorMessage ?? tErrors("generic")}
              </Text>
              <Button
                label={tErrors("retry")}
                variant="secondary"
                onClick={() => {
                  void refetchMembers();
                }}
                aria-label={tErrors("retryAriaLabel")}
              />
            </div>
          ) : members.length === 0 ? (
            <div className={styles["people-settings__empty"]}>
              <div className={styles["people-settings__empty-title"]}>
                {tMembers("emptyTitle")}
              </div>
              <Text
                variant="small"
                className={styles["people-settings__empty-description"]}
              >
                {tMembers("emptyDescription")}
              </Text>
            </div>
          ) : (
            <div
              className={styles["people-settings__list"]}
              role="list"
              aria-label={tMembersGlobal("listAriaLabel")}
            >
              {members.map((member) => {
                const displayName = getMemberDisplayName(member);
                const email = getMemberEmail(member);
                const isCurrentUser = member.userId === session?.userId;
                const isUpdating = updatingMemberId === member.id;
                const isRemoving = removingMemberId === member.id;
                const availableRoles = [
                  ...MANAGEABLE_ROLES,
                  ...(advancedRolesAccess.hasAccess ||
                  member.role === ProjectRole.VIEWER
                    ? [ProjectRole.VIEWER]
                    : []),
                ];

                return (
                  <article
                    key={member.id}
                    className={styles["people-settings__item"]}
                    role="listitem"
                  >
                    <div className={styles["people-settings__identity"]}>
                      <Avatar
                        src={member.profile.avatarUrl}
                        name={displayName}
                        size="md"
                      />

                      <div className={styles["people-settings__item-copy"]}>
                        <div className={styles["people-settings__name-row"]}>
                          <span className={styles["people-settings__name"]}>
                            {displayName}
                          </span>
                          <span
                            className={`${styles["people-settings__tag"]} ${
                              styles[`people-settings__tag--${member.role}`]
                            }`}
                          >
                            {tWorkspace(getRoleLabelKey(member.role))}
                          </span>
                          {isCurrentUser && (
                            <span
                              className={`${styles["people-settings__tag"]} ${styles["people-settings__tag--current"]}`}
                            >
                              {tMembersGlobal("you")}
                            </span>
                          )}
                        </div>

                        {email && (
                          <Text
                            variant="small"
                            className={styles["people-settings__meta"]}
                          >
                            {email}
                          </Text>
                        )}
                      </div>
                    </div>

                    <div className={styles["people-settings__member-actions"]}>
                      <label className={styles["people-settings__role-field"]}>
                        <span className={styles["people-settings__role-label"]}>
                          {tMembers("roleFieldLabel")}
                        </span>
                        <select
                          className={styles["people-settings__role-select"]}
                          value={member.role}
                          disabled={
                            !canManageMembers || isUpdating || isRemoving
                          }
                          aria-label={tMembersGlobal("changeRoleAriaLabel", {
                            name: displayName,
                          })}
                          onChange={(event) => {
                            void handleRoleChange(
                              member,
                              event.target.value as ProjectRole
                            );
                          }}
                        >
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>
                              {tWorkspace(getRoleLabelKey(role))}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className={styles["people-settings__remove"]}
                        disabled={
                          !canManageMembers ||
                          isUpdating ||
                          isRemoving ||
                          (member.role === ProjectRole.ADMIN && adminCount === 1)
                        }
                        aria-label={tMembersGlobal("removeAriaLabel", {
                          name: displayName,
                        })}
                        onClick={() => {
                          removeMemberMutation.reset();
                          setMemberPendingRemoval(member);
                        }}
                      >
                        {tMembersGlobal("remove")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={memberPendingRemoval != null}
        onClose={closeRemoveMemberModal}
        title={tMembersGlobal("removeModal.title")}
        size="medium"
      >
        <Text className={styles["people-settings__modal-copy"]}>
          {tMembersGlobal("removeModal.description", {
            name:
              memberPendingRemoval != null
                ? getMemberDisplayName(memberPendingRemoval)
                : "",
          })}
        </Text>

        <div className={styles["people-settings__modal-actions"]}>
          <Button
            label={tMembersGlobal("removeModal.cancel")}
            variant="secondary"
            onClick={closeRemoveMemberModal}
            disabled={removeMemberMutation.isPending}
          />
          <Button
            label={
              removeMemberMutation.isPending
                ? tMembersGlobal("removeModal.pending")
                : tMembersGlobal("removeModal.confirm")
            }
            variant="danger"
            onClick={() => {
              if (memberPendingRemoval != null) {
                void handleRemoveMember(memberPendingRemoval);
              }
            }}
            disabled={memberPendingRemoval == null || removeMemberMutation.isPending}
          />
        </div>
      </Modal>

      <Modal
        isOpen={invitationPendingRevoke != null}
        onClose={closeRevokeInvitationModal}
        title={tInvitations("revokeModal.title")}
        size="medium"
      >
        <Text className={styles["people-settings__modal-copy"]}>
          {tInvitations("revokeModal.description")}
        </Text>

        <div className={styles["people-settings__modal-actions"]}>
          <Button
            label={tInvitations("revokeModal.cancel")}
            variant="secondary"
            onClick={closeRevokeInvitationModal}
            disabled={revokeInvitationMutation.isPending}
          />
          <Button
            label={
              revokeInvitationMutation.isPending
                ? tInvitations("revokeModal.pending")
                : tInvitations("revokeModal.confirm")
            }
            variant="danger"
            onClick={() => {
              if (invitationPendingRevoke != null) {
                void handleRevokeInvitation(invitationPendingRevoke);
              }
            }}
            disabled={
              invitationPendingRevoke == null || revokeInvitationMutation.isPending
            }
          />
        </div>
      </Modal>
    </section>
  );
};

export default ProjectPeopleSettingsSection;
