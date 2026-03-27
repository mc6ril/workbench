"use client";

import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import Avatar from "@/shared/design-system/avatar";
import Card from "@/shared/design-system/card";
import Loader from "@/shared/design-system/loader";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { getIntlLocale, useTranslation } from "@/shared/i18n";

import TicketDetailCommentsSection from "./components/TicketDetailCommentsSection";
import TicketDetailDeleteModal from "./components/TicketDetailDeleteModal";
import TicketDetailHeader from "./components/TicketDetailHeader";
import TicketDetailInlinePopover from "./components/TicketDetailInlinePopover";
import TicketStatusBar from "./components/TicketStatusBar";
import styles from "./TicketDetailView.module.scss";

import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { TicketAssignee } from "@/modules/board/core/domain/schema/ticket.schema";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { useTicketDetailController } from "@/modules/board/presentation/hooks/ticket";
import { buildTicketCode } from "@/modules/board/utils/ticketUtils";

type Props = {
  projectId: string;
  ticketId: string;
  onClose: () => void;
};

const getMemberName = (member: ProjectMember): string => {
  return member.profile.displayName || member.profile.email;
};

const getAssigneeName = (
  assignee: TicketAssignee,
  members: ProjectMember[],
  fallbackLabel: string
): string => {
  if (assignee.displayName) {
    return assignee.displayName;
  }

  const member = members.find((projectMember) => projectMember.userId === assignee.userId);
  return member ? getMemberName(member) : fallbackLabel;
};

const parseCalendarDate = (value: string): Date | null => {
  const [year, month, day] = value.split("-").map((segment) => Number(segment));
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

const formatDateForDisplay = (value: string, intlLocale: string): string => {
  const parsed = parseCalendarDate(value);
  if (!parsed) {
    return value;
  }

  return new Intl.DateTimeFormat(intlLocale, {
    dateStyle: "medium",
  }).format(parsed);
};

const formatDateInputValue = (value: string | null): string => value ?? "";

const parseDateInputValue = (value: string): string | null => value || null;

const isDueDateOverdue = (value: string | null): boolean => {
  if (!value) {
    return false;
  }

  const dueDate = parseCalendarDate(value);
  if (!dueDate) {
    return false;
  }

  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return dueDay < currentDate;
};

const TicketDetailView = ({ projectId, ticketId, onClose }: Props) => {
  const t = useTranslation("pages.ticketDetail.page");
  const tCommon = useTranslation("common");
  const notesFieldId = getAccessibilityId("ticket-notes");
  const intlLocale = getIntlLocale();
  const { data: projectShortCode } = useProjectShortCode(projectId);

  const {
    ticket,
    error,
    sessionUserId,
    isLoading,
    canComment,
    canDeleteTicket,
    canEditTicket,
    comments,
    projectMembers,
    assignees,
    statusOptions,
    effectiveTitle,
    effectiveDescription,
    effectiveStatus,
    effectivePriority,
    effectiveDueDate,
    commentInput,
    editingCommentId,
    editingCommentContent,
    isDeleteModalOpen,
    isCreatingComment,
    isUpdatingComment,
    isDeletingComment,
    isSavingMainFields,
    isDeletingTicket,
    isUpdatingAssignees,
    setTitleDraft,
    setDescriptionDraft,
    setStatusDraft,
    setPriorityDraft,
    setDueDateDraft,
    setCommentInput,
    setEditingCommentContent,
    setIsDeleteModalOpen,
    handleSaveMainFields,
    handleAssign,
    handleUnassign,
    handleCreateComment,
    handleStartCommentEditing,
    handleCancelCommentEditing,
    handleSaveComment,
    handleDeleteComment,
    handleDeleteTicket,
  } = useTicketDetailController({
    projectId,
    ticketId,
  });

  const canSaveMainFields =
    canEditTicket && effectiveTitle.trim().length > 0 && !isSavingMainFields;

  if (isLoading) {
    return <Loader variant="full-page" />;
  }

  if (!ticket || error) {
    return (
      <Card className={styles["ticket-detail__error"]}>
        <Title variant="h2">{t("states.errorTitle")}</Title>
        <Text variant="body">{t("states.errorMessage")}</Text>
      </Card>
    );
  }

  const ticketCode =
    buildTicketCode(projectShortCode, ticket.codeNumber) ?? String(ticket.codeNumber);

  const visibleAssignees = assignees.slice(0, 4);
  const extraAssigneeCount = Math.max(assignees.length - 4, 0);

  const dueDateLabel = effectiveDueDate
    ? formatDateForDisplay(effectiveDueDate, intlLocale)
    : t("fields.none");
  const isOverdue = isDueDateOverdue(effectiveDueDate);

  return (
    <section className={styles["ticket-detail"]}>
      <TicketDetailHeader
        title={effectiveTitle}
        ticketCode={ticketCode}
        canEditTicket={canEditTicket}
        onTitleChange={setTitleDraft}
        onClose={onClose}
      />

      <TicketStatusBar
        canEditTicket={canEditTicket}
        effectiveStatus={effectiveStatus}
        effectivePriority={effectivePriority}
        statusOptions={statusOptions}
        onStatusChange={setStatusDraft}
        onPriorityChange={setPriorityDraft}
      />

      <Card className={styles["ticket-detail__card"]}>
        <div className={styles["ticket-detail__section"]}>
          <div className={styles["ticket-detail__section-header"]}>
            <label
              htmlFor={notesFieldId}
              className={styles["ticket-detail__section-label"]}
            >
              {t("fields.notes")}
            </label>
          </div>
          <textarea
            id={notesFieldId}
            className={styles["ticket-detail__notes"]}
            rows={5}
            value={effectiveDescription}
            placeholder={t("fields.notesPlaceholder")}
            disabled={!canEditTicket}
            onChange={(event) => {
              setDescriptionDraft(event.target.value);
            }}
          />
        </div>

        <div className={styles["ticket-detail__section"]}>
          <div className={styles["ticket-detail__section-header"]}>
            <span className={styles["ticket-detail__section-label"]}>
              {t("sections.details")}
            </span>
          </div>

          <div className={styles["ticket-detail__meta-list"]}>
            <div className={styles["ticket-detail__meta-row"]}>
              <span className={styles["ticket-detail__meta-key"]}>
                {t("fields.assignee")}
              </span>

              <TicketDetailInlinePopover
                panelAriaLabel={t("fields.assignee")}
                disabled={!canEditTicket}
                align="end"
                renderTrigger={({ buttonProps, isOpen }) => (
                  <button
                    {...buttonProps}
                    className={[
                      styles["ticket-detail__meta-button"],
                      isOpen && styles["ticket-detail__meta-button--active"],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {visibleAssignees.length > 0 ? (
                      <div className={styles["ticket-detail__assignee-stack"]}>
                        {visibleAssignees.map((assignee) => {
                          const name = getAssigneeName(
                            assignee,
                            projectMembers,
                            t("comments.unknownAuthor")
                          );
                          return (
                            <Avatar
                              key={assignee.userId}
                              src={assignee.avatarUrl ?? null}
                              name={name}
                              size="sm"
                              aria-label={name}
                            />
                          );
                        })}
                        {extraAssigneeCount > 0 ? (
                          <span className={styles["ticket-detail__assignee-extra"]}>
                            +{extraAssigneeCount}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className={styles["ticket-detail__meta-value--empty"]}>
                        {t("fields.none")}
                      </span>
                    )}
                  </button>
                )}
              >
                {({ close }) => (
                  <div className={styles["ticket-detail__popover-list"]}>
                    {projectMembers.map((member) => {
                      const isAssigned = assignees.some(
                        (assignee) => assignee.userId === member.userId
                      );

                      return (
                        <button
                          key={member.userId}
                          type="button"
                          className={[
                            styles["ticket-detail__popover-option"],
                            isAssigned &&
                              styles["ticket-detail__popover-option--selected"],
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          disabled={isUpdatingAssignees}
                          onClick={() => {
                            void (async () => {
                              try {
                                if (isAssigned) {
                                  await handleUnassign(member.userId);
                                } else {
                                  await handleAssign(member.userId);
                                }
                                close();
                              } catch {
                                // Keep the popover open so the user can retry.
                              }
                            })();
                          }}
                        >
                          <Avatar
                            src={member.profile.avatarUrl}
                            name={getMemberName(member)}
                            size="sm"
                            aria-label={getMemberName(member)}
                          />
                          <span className={styles["ticket-detail__popover-option-copy"]}>
                            {getMemberName(member)}
                          </span>
                          {isAssigned ? (
                            <span className={styles["ticket-detail__popover-check"]}>
                              ✓
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </TicketDetailInlinePopover>
            </div>

            <div className={styles["ticket-detail__meta-row"]}>
              <span className={styles["ticket-detail__meta-key"]}>
                {t("fields.dueDate")}
              </span>

              <TicketDetailInlinePopover
                panelAriaLabel={t("fields.dueDate")}
                disabled={!canEditTicket}
                align="end"
                renderTrigger={({ buttonProps, isOpen }) => (
                  <button
                    {...buttonProps}
                    className={[
                      styles["ticket-detail__meta-button"],
                      isOpen && styles["ticket-detail__meta-button--active"],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span
                      className={[
                        styles["ticket-detail__date-badge"],
                        isOverdue && styles["ticket-detail__date-badge--overdue"],
                        !effectiveDueDate &&
                          styles["ticket-detail__date-badge--empty"],
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {dueDateLabel}
                    </span>
                  </button>
                )}
              >
                {({ close }) => (
                  <div className={styles["ticket-detail__date-picker"]}>
                    <input
                      type="date"
                      className={styles["ticket-detail__date-input"]}
                      aria-label={t("fields.dueDate")}
                      value={formatDateInputValue(effectiveDueDate)}
                      onChange={(event) => {
                        setDueDateDraft(parseDateInputValue(event.target.value));
                        close();
                      }}
                    />

                    <div className={styles["ticket-detail__date-actions"]}>
                      <button
                        type="button"
                        className={styles["ticket-detail__secondary-action"]}
                        onClick={() => {
                          setDueDateDraft(null);
                          close();
                        }}
                      >
                        {t("fields.none")}
                      </button>
                      <button
                        type="button"
                        className={styles["ticket-detail__secondary-action"]}
                        onClick={close}
                      >
                        {tCommon("cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </TicketDetailInlinePopover>
            </div>

          </div>
        </div>

        <TicketDetailCommentsSection
          comments={comments}
          projectMembers={projectMembers}
          sessionUserId={sessionUserId}
          canComment={canComment}
          commentInput={commentInput}
          editingCommentId={editingCommentId}
          editingCommentContent={editingCommentContent}
          isCreatingComment={isCreatingComment}
          isUpdatingComment={isUpdatingComment}
          isDeletingComment={isDeletingComment}
          onCommentInputChange={setCommentInput}
          onCreateComment={() => {
            void handleCreateComment();
          }}
          onEditingCommentContentChange={setEditingCommentContent}
          onStartCommentEditing={handleStartCommentEditing}
          onCancelCommentEditing={handleCancelCommentEditing}
          onSaveComment={(commentId) => {
            void handleSaveComment(commentId);
          }}
          onDeleteComment={(commentId) => {
            void handleDeleteComment(commentId);
          }}
        />

        <div className={styles["ticket-detail__actions-row"]}>
          <button
            type="button"
            className={[
              styles["ticket-detail__action-button"],
              styles["ticket-detail__action-button--save"],
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              void handleSaveMainFields();
            }}
            disabled={!canSaveMainFields}
          >
            {t("actions.save")}
          </button>

          {canDeleteTicket ? (
            <button
              type="button"
              className={[
                styles["ticket-detail__action-button"],
                styles["ticket-detail__action-button--delete"],
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setIsDeleteModalOpen(true);
              }}
              disabled={isDeletingTicket}
            >
              {tCommon("delete")}
            </button>
          ) : null}
        </div>
      </Card>

      <TicketDetailDeleteModal
        isOpen={isDeleteModalOpen}
        isDeletingTicket={isDeletingTicket}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        onConfirmDelete={() => {
          void handleDeleteTicket();
        }}
      />
    </section>
  );
};

export default TicketDetailView;
