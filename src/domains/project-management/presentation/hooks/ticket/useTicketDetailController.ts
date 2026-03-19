import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { TicketPriority } from "@/domains/project-management/core/domain/schema/ticket.schema";

import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/presentation/hooks/comment";
import {
  useAddTicketLabels,
  useLabels,
  useRemoveTicketLabels,
  useTicketLabelIds,
} from "@/presentation/hooks/label";
import { useProjectMembers } from "@/presentation/hooks/member/useProjectMembers";
import { useProjectPermissions } from "@/presentation/providers/permissions";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { buildProjectRoute } from "@/shared/utils/routes";

import { useSession } from "@/domains/auth/presentation/hooks/useSession";
import { PlanFeature } from "@/domains/billing/core/domain/rules/planFeatures.rules";
import { useFeatureAccess } from "@/domains/billing/presentation/hooks/useFeatureAccess";
import { useBoardConfiguration } from "@/domains/project-management/presentation/hooks/board/useBoardConfiguration";
import { useEpics } from "@/domains/project-management/presentation/hooks/epic/useEpics";
import { useSprints } from "@/domains/project-management/presentation/hooks/sprint";
import {
  useAssignTicket,
  useCreateSubtask,
  useDeleteTicket,
  useTicket,
  useTicketAssignees,
  useTickets,
  useUnassignTicket,
  useUpdateTicket,
} from "@/domains/project-management/presentation/hooks/ticket";

type UseTicketDetailControllerParams = {
  projectId: string;
  ticketId: string;
};

export type TicketDetailStatusOption = {
  value: string;
  label: string;
  state: "todo" | "in_progress" | "done";
};

export const useTicketDetailController = ({
  projectId,
  ticketId,
}: UseTicketDetailControllerParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: session } = useSession();
  const {
    canComment,
    canDeleteTicket,
    canEditTicket,
    isLoading: isPermissionsLoading,
  } = useProjectPermissions();
  const {
    data: ticket,
    isLoading: isTicketLoading,
    error,
  } = useTicket(ticketId);
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

  const statusOptions = useMemo<TicketDetailStatusOption[]>(() => {
    const columns = boardConfiguration?.columns ?? [];
    return columns.map((column) => ({
      value: column.status,
      label: column.name,
      state: column.state,
    }));
  }, [boardConfiguration?.columns]);

  const assignedLabelIdSet = useMemo(() => {
    return new Set(ticketLabelIds);
  }, [ticketLabelIds]);

  const doneStatuses = useMemo(() => {
    return new Set(
      statusOptions
        .filter((option) => option.state === "done")
        .map((option) => option.value)
    );
  }, [statusOptions]);

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

    setTitleDraft(null);
    setDescriptionDraft(null);
    setStatusDraft(null);
    setPriorityDraft(null);
    setSprintIdDraft(null);
    setEpicIdDraft(null);
  }, [
    canEditTicket,
    effectiveDescription,
    effectiveEpicId,
    effectivePriority,
    effectiveSprintId,
    effectiveStatus,
    effectiveTitle,
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
        return;
      }

      await addTicketLabelsMutation.mutateAsync([labelId]);
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

  const handleStartCommentEditing = useCallback(
    (commentId: string, content: string): void => {
      setEditingCommentId(commentId);
      setEditingCommentContent(content);
    },
    []
  );

  const handleCancelCommentEditing = useCallback((): void => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  }, []);

  const handleSaveComment = useCallback(
    async (commentId: string): Promise<void> => {
      const content = editingCommentContent.trim();
      if (!content) {
        return;
      }

      await updateCommentMutation.mutateAsync({
        commentId,
        input: { content },
      });
      handleCancelCommentEditing();
    },
    [editingCommentContent, handleCancelCommentEditing, updateCommentMutation]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      await deleteCommentMutation.mutateAsync(commentId);
    },
    [deleteCommentMutation]
  );

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
      ticket?.status,
      ticketId,
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

  return {
    ticket,
    error,
    sessionUserId: session?.userId,
    isLoading: isTicketLoading || isPermissionsLoading,
    canComment,
    canDeleteTicket,
    canEditTicket,
    hasEpicsAccess,
    comments,
    subtasks,
    epics,
    sprints,
    labels,
    projectMembers,
    assignees,
    statusOptions,
    assignedLabelIdSet,
    doneStatuses,
    effectiveTitle,
    effectiveDescription,
    effectiveStatus,
    effectivePriority,
    effectiveSprintId,
    effectiveEpicId,
    commentInput,
    editingCommentId,
    editingCommentContent,
    isSubtaskFormOpen,
    isDeleteModalOpen,
    isCreatingComment: createCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isCreatingSubtask: createSubtaskMutation.isPending,
    isSavingMainFields: updateMainTicketMutation.isPending,
    isDeletingTicket: deleteTicketMutation.isPending,
    isUpdatingAssignees:
      assignTicketMutation.isPending || unassignTicketMutation.isPending,
    createSubtaskErrorMessage,
    setTitleDraft,
    setDescriptionDraft,
    setStatusDraft,
    setPriorityDraft,
    setSprintIdDraft,
    setEpicIdDraft,
    setCommentInput,
    setEditingCommentContent,
    setIsSubtaskFormOpen,
    setIsDeleteModalOpen,
    handleSaveMainFields,
    handleToggleLabel,
    handleAssign,
    handleUnassign,
    handleCreateComment,
    handleStartCommentEditing,
    handleCancelCommentEditing,
    handleSaveComment,
    handleDeleteComment,
    handleCreateSubtask,
    handleToggleSubtaskCompleted,
    handleDeleteSubtask,
    handleDeleteTicket,
  };
};
