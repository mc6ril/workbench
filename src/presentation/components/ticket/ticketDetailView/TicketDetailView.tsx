"use client";

import React, { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PlanFeature } from "@/core/domain/rules/planFeatures.rules";
import type { TicketPriority } from "@/core/domain/schema/ticket.schema";

import AssigneePicker from "@/presentation/components/ticket/assigneePicker/AssigneePicker";
import CreateSubtaskForm from "@/presentation/components/ticket/createSubtaskForm/CreateSubtaskForm";
import SubtasksList from "@/presentation/components/ticket/subtasksList/SubtasksList";
import Button from "@/presentation/components/ui/Button";
import Card from "@/presentation/components/ui/Card";
import Loader from "@/presentation/components/ui/Loader";
import Modal from "@/presentation/components/ui/Modal";
import Select from "@/presentation/components/ui/Select";
import Text from "@/presentation/components/ui/Text";
import Textarea from "@/presentation/components/ui/Textarea";
import Title from "@/presentation/components/ui/Title";
import { useSession } from "@/presentation/hooks/auth/useSession";
import { useBoardConfiguration } from "@/presentation/hooks/board/useBoardConfiguration";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/presentation/hooks/comment";
import { useEpics } from "@/presentation/hooks/epic/useEpics";
import {
  useAddTicketLabels,
  useLabels,
  useRemoveTicketLabels,
  useTicketLabelIds,
} from "@/presentation/hooks/label";
import { useProjectMembers } from "@/presentation/hooks/member/useProjectMembers";
import { useSprints } from "@/presentation/hooks/sprint";
import { useFeatureAccess } from "@/presentation/hooks/subscription/useFeatureAccess";
import {
  useAssignTicket,
  useCreateSubtask,
  useDeleteTicket,
  useTicket,
  useTicketAssignees,
  useTickets,
  useUnassignTicket,
  useUpdateTicket,
} from "@/presentation/hooks/ticket";
import { useProjectPermissions } from "@/presentation/providers/permissions";

import { getAccessibilityId } from "@/shared/a11y";
import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslation } from "@/shared/i18n";
import { buildProjectRoute } from "@/shared/utils/routes";

import styles from "./TicketDetailView.module.scss";

type Props = {
  projectId: string;
  ticketId: string;
};

type StatusOption = {
  value: string;
  label: string;
  state: "todo" | "in_progress" | "done";
};

const PRIORITY_VALUES: TicketPriority[] = [
  "highest",
  "high",
  "medium",
  "low",
  "lowest",
];

const TicketDetailView = ({ projectId, ticketId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslation("pages.ticketDetail.page");
  const tCommon = useTranslation("common");

  const { data: session } = useSession();
  const {
    canComment,
    canDeleteTicket,
    canEditTicket,
    isLoading: isPermissionsLoading,
  } = useProjectPermissions();
  const { data: ticket, isLoading, error } = useTicket(ticketId);
  const { data: boardConfiguration } = useBoardConfiguration(projectId);
  const { data: epics = [] } = useEpics(projectId);
  const { data: sprints = [] } = useSprints(projectId);
  const { data: labels = [] } = useLabels(projectId);
  const { data: ticketLabelIds = [] } = useTicketLabelIds(ticketId);
  const { data: projectMembers = [] } = useProjectMembers(projectId);
  const { data: assignees = [] } = useTicketAssignees(ticketId);
  const { data: comments = [] } = useComments(ticketId);
  const { data: subtasks = [] } = useTickets(projectId, { parentId: ticketId });
  const { hasAccess: hasEpicsAccess } = useFeatureAccess(PlanFeature.EPICS);

  const updateMainTicketMutation = useUpdateTicket();
  const updateSubtaskMutation = useUpdateTicket();
  const createSubtaskMutation = useCreateSubtask();
  const deleteTicketMutation = useDeleteTicket();
  const assignTicketMutation = useAssignTicket();
  const unassignTicketMutation = useUnassignTicket();
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment(ticketId);
  const deleteCommentMutation = useDeleteComment(ticketId);
  const addTicketLabelsMutation = useAddTicketLabels(ticketId);
  const removeTicketLabelsMutation = useRemoveTicketLabels(ticketId);

  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<string | null>(null);
  const [priorityDraft, setPriorityDraft] = useState<string | null>(null);
  const [sprintIdDraft, setSprintIdDraft] = useState<string | null>(null);
  const [epicIdDraft, setEpicIdDraft] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isSubtaskFormOpen, setIsSubtaskFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const statusOptions = useMemo<StatusOption[]>(() => {
    const columns = boardConfiguration?.columns ?? [];
    return columns.map((column) => ({
      value: column.status,
      label: column.name,
      state: column.state,
    }));
  }, [boardConfiguration?.columns]);

  const priorityOptions = useMemo(() => {
    return [
      { value: "", label: t("fields.none") },
      ...PRIORITY_VALUES.map((value) => ({
        value,
        label: t(`priority.${value}`),
      })),
    ];
  }, [t]);

  const sprintOptions = useMemo(() => {
    return [
      { value: "", label: t("fields.none") },
      ...sprints.map((sprint) => ({ value: sprint.id, label: sprint.name })),
    ];
  }, [sprints, t]);

  const epicOptions = useMemo(() => {
    return [
      { value: "", label: t("fields.none") },
      ...epics.map((epic) => ({ value: epic.id, label: epic.name })),
    ];
  }, [epics, t]);

  const assignedLabelIdSet = useMemo(() => {
    return new Set(ticketLabelIds);
  }, [ticketLabelIds]);

  const effectiveTitle = titleDraft ?? ticket?.title ?? "";
  const effectiveDescription = descriptionDraft ?? ticket?.description ?? "";
  const effectiveStatus = statusDraft ?? ticket?.status ?? "";
  const effectivePriority = priorityDraft ?? ticket?.priority ?? "";
  const effectiveSprintId = sprintIdDraft ?? ticket?.sprintId ?? "";
  const effectiveEpicId = epicIdDraft ?? ticket?.epicId ?? "";

  const handleSaveMainFields = useCallback(async (): Promise<void> => {
    if (!ticket || !canEditTicket) {
      return;
    }

    await updateMainTicketMutation.mutateAsync({
      id: ticket.id,
      input: {
        title: effectiveTitle,
        description: effectiveDescription || null,
        status: effectiveStatus || undefined,
        priority: (effectivePriority as TicketPriority) || null,
        sprintId: effectiveSprintId || null,
        epicId: effectiveEpicId || null,
        position: ticket.position,
      },
    });
  }, [
    effectiveDescription,
    effectiveEpicId,
    effectivePriority,
    effectiveSprintId,
    effectiveStatus,
    effectiveTitle,
    canEditTicket,
    ticket,
    updateMainTicketMutation,
  ]);

  const handleToggleLabel = useCallback(
    async (labelId: string): Promise<void> => {
      if (!canEditTicket) {
        return;
      }

      if (assignedLabelIdSet.has(labelId)) {
        await removeTicketLabelsMutation.mutateAsync([labelId]);
      } else {
        await addTicketLabelsMutation.mutateAsync([labelId]);
      }
    },
    [
      addTicketLabelsMutation,
      assignedLabelIdSet,
      canEditTicket,
      removeTicketLabelsMutation,
    ]
  );

  const handleAssign = useCallback(
    async (userId: string): Promise<void> => {
      if (!canEditTicket) {
        return;
      }

      await assignTicketMutation.mutateAsync({
        ticketId,
        userIds: [userId],
        projectId,
      });
    },
    [assignTicketMutation, canEditTicket, projectId, ticketId]
  );

  const handleUnassign = useCallback(
    async (userId: string): Promise<void> => {
      if (!canEditTicket) {
        return;
      }

      await unassignTicketMutation.mutateAsync({
        ticketId,
        userIds: [userId],
        projectId,
      });
    },
    [canEditTicket, projectId, ticketId, unassignTicketMutation]
  );

  const handleCreateComment = useCallback(async (): Promise<void> => {
    if (!canComment) {
      return;
    }

    const content = commentInput.trim();
    if (!content) {
      return;
    }

    await createCommentMutation.mutateAsync({
      ticketId,
      content,
    });
    setCommentInput("");
  }, [canComment, commentInput, createCommentMutation, ticketId]);

  const handleCreateSubtask = useCallback(
    async (values: { title: string; description?: string }): Promise<void> => {
      if (!canEditTicket) {
        return;
      }

      const fallbackStatus = statusOptions[0]?.value ?? ticket?.status ?? "";

      await createSubtaskMutation.mutateAsync({
        projectId,
        parentId: ticketId,
        title: values.title,
        description: values.description ?? null,
        status: fallbackStatus,
        position: subtasks.length,
      });

      setIsSubtaskFormOpen(false);
    },
    [
      canEditTicket,
      createSubtaskMutation,
      projectId,
      statusOptions,
      subtasks.length,
      ticketId,
      ticket?.status,
    ]
  );

  const handleToggleSubtaskCompleted = useCallback(
    (subtaskId: string): void => {
      if (!canEditTicket) {
        return;
      }

      const subtask = subtasks.find((item) => item.id === subtaskId);
      if (!subtask) {
        return;
      }

      const doneStatus = statusOptions.find(
        (option) => option.state === "done"
      )?.value;
      const defaultStatus = statusOptions[0]?.value ?? subtask.status;

      const nextStatus =
        subtask.status === doneStatus
          ? defaultStatus
          : (doneStatus ?? defaultStatus);

      updateSubtaskMutation.mutate({
        id: subtask.id,
        input: { status: nextStatus },
      });
    },
    [canEditTicket, statusOptions, subtasks, updateSubtaskMutation]
  );

  const handleDeleteSubtask = useCallback(
    (subtaskId: string): void => {
      if (!canDeleteTicket) {
        return;
      }

      deleteTicketMutation.mutate({
        projectId,
        ticketId: subtaskId,
      });
    },
    [canDeleteTicket, deleteTicketMutation, projectId]
  );

  const handleDeleteTicket = useCallback(async (): Promise<void> => {
    if (!canDeleteTicket || deleteTicketMutation.isPending) {
      return;
    }

    await deleteTicketMutation.mutateAsync({
      projectId,
      ticketId,
    });

    const params = new URLSearchParams(searchParams.toString());
    if (params.get("ticket") === ticketId) {
      params.delete("ticket");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
      return;
    }

    router.push(buildProjectRoute(projectId, PROJECT_VIEWS.BOARD));
  }, [
    canDeleteTicket,
    deleteTicketMutation,
    pathname,
    projectId,
    router,
    searchParams,
    ticketId,
  ]);

  const createSubtaskErrorMessage =
    createSubtaskMutation.error instanceof Error
      ? createSubtaskMutation.error.message
      : undefined;
  const doneStatuses = useMemo(() => {
    return new Set(
      statusOptions
        .filter((option) => option.state === "done")
        .map((option) => option.value)
    );
  }, [statusOptions]);

  if (isLoading || isPermissionsLoading) {
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

  return (
    <section className={styles["ticket-detail"]}>
      <div className={styles["ticket-detail__grid"]}>
        <Card className={styles["ticket-detail__main"]}>
          <div className={styles["ticket-detail__field"]}>
            <label htmlFor={getAccessibilityId("ticket-title")}>
              {t("fields.title")}
            </label>
            <input
              id={getAccessibilityId("ticket-title")}
              className={styles["ticket-detail__input"]}
              value={effectiveTitle}
              disabled={!canEditTicket}
              onChange={(event) => {
                setTitleDraft(event.target.value);
              }}
            />
          </div>

          <div className={styles["ticket-detail__field"]}>
            <Textarea
              label={t("fields.description")}
              value={effectiveDescription}
              rows={6}
              disabled={!canEditTicket}
              onChange={(event) => {
                setDescriptionDraft(event.target.value);
              }}
            />
          </div>

          <div className={styles["ticket-detail__comments"]}>
            <Title variant="h3">{t("comments.title")}</Title>
            <Textarea
              label={t("comments.newLabel")}
              value={commentInput}
              rows={3}
              helperText={
                canComment ? undefined : t("comments.readOnlyHint")
              }
              disabled={!canComment || createCommentMutation.isPending}
              onChange={(event) => {
                setCommentInput(event.target.value);
              }}
            />
            <Button
              label={t("comments.addButton")}
              variant="publish"
              onClick={handleCreateComment}
              disabled={
                !canComment ||
                createCommentMutation.isPending ||
                commentInput.trim().length === 0
              }
            />

            <div className={styles["ticket-detail__comment-list"]}>
              {comments.map((comment) => {
                const canEdit =
                  canComment && comment.authorId === session?.userId;
                const isEditing = editingCommentId === comment.id;

                return (
                  <Card
                    key={comment.id}
                    className={styles["ticket-detail__comment"]}
                  >
                    <Text variant="caption">
                      {t("comments.author", {
                        author:
                          comment.authorDisplayName ??
                          t("comments.unknownAuthor"),
                      })}
                    </Text>
                    {isEditing ? (
                      <Textarea
                        label={t("comments.editLabel")}
                        value={editingCommentContent}
                        rows={3}
                        onChange={(event) => {
                          setEditingCommentContent(event.target.value);
                        }}
                      />
                    ) : (
                      <Text variant="body">{comment.content}</Text>
                    )}

                    {canEdit && (
                      <div className={styles["ticket-detail__comment-actions"]}>
                        {isEditing ? (
                          <>
                            <Button
                              label={t("comments.saveEdit")}
                              variant="save"
                              onClick={async () => {
                                await updateCommentMutation.mutateAsync({
                                  commentId: comment.id,
                                  input: { content: editingCommentContent },
                                });
                                setEditingCommentId(null);
                                setEditingCommentContent("");
                              }}
                              disabled={updateCommentMutation.isPending}
                            />
                            <Button
                              label={tCommon("cancel")}
                              variant="secondary"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentContent("");
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <Button
                              label={t("comments.editButton")}
                              variant="edit"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingCommentContent(comment.content);
                              }}
                            />
                            <Button
                              label={t("comments.deleteButton")}
                              variant="delete"
                              onClick={async () => {
                                await deleteCommentMutation.mutateAsync(
                                  comment.id
                                );
                              }}
                              disabled={deleteCommentMutation.isPending}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className={styles["ticket-detail__aside"]}>
          <Select
            label={t("fields.status")}
            value={effectiveStatus}
            options={statusOptions}
            disabled={!canEditTicket}
            onChange={(event) => {
              setStatusDraft(event.target.value);
            }}
          />

          <Select
            label={t("fields.priority")}
            value={effectivePriority}
            options={priorityOptions}
            disabled={!canEditTicket}
            onChange={(event) => {
              setPriorityDraft(event.target.value);
            }}
          />

          {hasEpicsAccess && (
            <Select
              label={t("fields.epic")}
              value={effectiveEpicId}
              options={epicOptions}
              disabled={!canEditTicket}
              onChange={(event) => {
                setEpicIdDraft(event.target.value);
              }}
            />
          )}

          <Select
            label={t("fields.sprint")}
            value={effectiveSprintId}
            options={sprintOptions}
            disabled={!canEditTicket}
            onChange={(event) => {
              setSprintIdDraft(event.target.value);
            }}
          />

          <div className={styles["ticket-detail__labels"]}>
            <Text variant="caption">{t("fields.labels")}</Text>
            <div className={styles["ticket-detail__label-list"]}>
              {labels.map((label) => {
                const isSelected = assignedLabelIdSet.has(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    className={`${styles["ticket-detail__label-chip"]} ${
                      isSelected
                        ? styles["ticket-detail__label-chip--active"]
                        : ""
                    }`}
                    disabled={!canEditTicket}
                    onClick={() => {
                      void handleToggleLabel(label.id);
                    }}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </div>

          <AssigneePicker
            members={projectMembers}
            assignees={assignees}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            disabled={!canEditTicket}
            isLoading={
              assignTicketMutation.isPending || unassignTicketMutation.isPending
            }
          />

          <div className={styles["ticket-detail__actions"]}>
            <Button
              label={t("actions.save")}
              variant="save"
              fullWidth
              onClick={() => {
                void handleSaveMainFields();
              }}
              disabled={
                !canEditTicket ||
                updateMainTicketMutation.isPending ||
                effectiveTitle.trim().length === 0
              }
            />
            {canDeleteTicket && (
              <Button
                label={t("actions.delete")}
                variant="saveDanger"
                fullWidth
                onClick={() => {
                  setIsDeleteModalOpen(true);
                }}
                disabled={deleteTicketMutation.isPending}
              />
            )}
          </div>
        </Card>
      </div>

      <section className={styles["ticket-detail__subtasks"]}>
        <SubtasksList
          subtasks={subtasks.map((subtask) => ({
            id: subtask.id,
            title: subtask.title,
            isCompleted: doneStatuses.has(subtask.status),
          }))}
          onToggleCompleted={
            canEditTicket ? handleToggleSubtaskCompleted : undefined
          }
          onDelete={
            canDeleteTicket ? handleDeleteSubtask : undefined
          }
          emptyStateAction={
            canEditTicket ? (
              <Button
                label={t("subtasks.addButton")}
                variant="secondary"
                onClick={() => {
                  setIsSubtaskFormOpen(true);
                }}
              />
            ) : undefined
          }
        />
        {canEditTicket && isSubtaskFormOpen && (
          <CreateSubtaskForm
            onSubmit={handleCreateSubtask}
            onCancel={() => {
              setIsSubtaskFormOpen(false);
            }}
            isSubmitting={createSubtaskMutation.isPending}
            errorMessage={createSubtaskErrorMessage}
          />
        )}
      </section>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        title={t("actions.deleteModal.title")}
        size="medium"
      >
        <Text variant="small">{t("actions.deleteModal.message")}</Text>
        <div className={styles["ticket-detail__delete-modal-actions"]}>
          <Button
            label={
              deleteTicketMutation.isPending
                ? t("actions.deleteModal.deleting")
                : t("actions.deleteModal.confirm")
            }
            variant="saveDanger"
            fullWidth
            onClick={() => {
              void handleDeleteTicket();
            }}
            disabled={deleteTicketMutation.isPending}
          />
          <Button
            label={tCommon("cancel")}
            variant="secondary"
            fullWidth
            onClick={() => {
              setIsDeleteModalOpen(false);
            }}
            disabled={deleteTicketMutation.isPending}
          />
        </div>
      </Modal>
    </section>
  );
};

export default TicketDetailView;
