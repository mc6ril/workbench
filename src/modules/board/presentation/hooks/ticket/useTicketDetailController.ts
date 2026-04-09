import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslations } from "@/shared/i18n";
import { buildProjectRoute } from "@/shared/utils/routes";

import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import { useSession } from "@/domains/session/presentation/hooks/useSession";
import type { ColumnWorkflowState } from "@/modules/board/core/domain/board.types";
import type { TicketPriority } from "@/modules/board/core/domain/ticket.types";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/modules/board/presentation/hooks/comment";
import {
  useAssignTicket,
  useDeleteTicket,
  useTicket,
  useTicketAssignees,
  useUnassignTicket,
  useUpdateTicket,
} from "@/modules/board/presentation/hooks/ticket";
import { getBoardColumnDisplayName } from "@/modules/board/presentation/utils/columnI18n";

type UseTicketDetailControllerParams = {
  projectId: string;
  ticketId: string;
};

export type TicketDetailStatusOption = {
  value: string;
  label: string;
  state: ColumnWorkflowState;
};

export const useTicketDetailController = ({
  projectId,
  ticketId,
}: UseTicketDetailControllerParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tColumns = useTranslations("pages.board.columns");

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
  const { data: projectMembers = [] } = useProjectMembers(projectId);
  const { data: assignees = [] } = useTicketAssignees(ticketId);
  const { data: comments = [] } = useComments(ticketId);

  const updateMainTicketMutation = useUpdateTicket();
  const deleteTicketMutation = useDeleteTicket();
  const assignTicketMutation = useAssignTicket();
  const unassignTicketMutation = useUnassignTicket();
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment(ticketId);
  const deleteCommentMutation = useDeleteComment(ticketId);

  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null);
  const [columnIdDraft, setColumnIdDraft] = useState<string | null>(null);
  const [priorityDraft, setPriorityDraft] = useState<TicketPriority | "" | null>(
    null
  );
  const [dueDateDraft, setDueDateDraft] = useState<string | null | undefined>(
    undefined
  );
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const statusOptions = useMemo<TicketDetailStatusOption[]>(() => {
    const columns = boardConfiguration?.columns ?? [];
    return columns.map((column) => ({
      value: column.id,
      label: getBoardColumnDisplayName(column, tColumns),
      state: column.state,
    }));
  }, [boardConfiguration?.columns, tColumns]);

  const effectiveTitle = titleDraft ?? ticket?.title ?? "";
  const effectiveDescription = descriptionDraft ?? ticket?.description ?? "";
  const effectiveColumnId = columnIdDraft ?? ticket?.columnId ?? "";
  const effectivePriority: TicketPriority | "" =
    priorityDraft ?? ticket?.priority ?? "";
  const effectiveDueDate =
    dueDateDraft === undefined ? ticket?.dueDate ?? null : dueDateDraft;

  const handleSaveMainFields = useCallback(async (): Promise<void> => {
    if (!ticket || !canEditTicket) {
      return;
    }

    await updateMainTicketMutation.mutateAsync({
      id: ticket.id,
      input: {
        title: effectiveTitle,
        description: effectiveDescription || null,
        columnId: effectiveColumnId || undefined,
        priority: (effectivePriority as TicketPriority) || null,
        dueDate: effectiveDueDate,
        position: ticket.position,
      },
    });

    setTitleDraft(null);
    setDescriptionDraft(null);
    setColumnIdDraft(null);
    setPriorityDraft(null);
    setDueDateDraft(undefined);
  }, [
    canEditTicket,
    effectiveColumnId,
    effectiveDescription,
    effectiveDueDate,
    effectivePriority,
    effectiveTitle,
    ticket,
    updateMainTicketMutation,
  ]);

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

  const isTicketArchived = ticket?.archivedAt != null;
  const isTicketInDoneColumn = useMemo((): boolean => {
    const column = statusOptions.find(
      (option) => option.value === effectiveColumnId
    );
    return column?.state === "done";
  }, [effectiveColumnId, statusOptions]);

  const handleUnarchiveTicket = useCallback(async (): Promise<void> => {
    if (!ticket || !canEditTicket || !isTicketArchived) {
      return;
    }

    try {
      await updateMainTicketMutation.mutateAsync({
        id: ticket.id,
        input: {
          archivedAt: null,
          archivedWeekStart: null,
          // Prevent immediate re-archival when unarchiving a ticket that remains in
          // a done column: the weekly batch uses completedAt eligibility.
          completedAt: isTicketInDoneColumn ? new Date() : undefined,
        },
      });
    } catch {
      // React Query already tracks errors; prevent an unhandled rejection in the click handler.
    }
  }, [
    canEditTicket,
    isTicketArchived,
    isTicketInDoneColumn,
    ticket,
    updateMainTicketMutation,
  ]);

  return {
    ticket,
    error,
    sessionUserId: session?.userId,
    isLoading: isTicketLoading || isPermissionsLoading,
    canComment,
    canDeleteTicket,
    canEditTicket,
    comments,
    projectMembers,
    assignees,
    statusOptions,
    effectiveTitle,
    effectiveDescription,
    effectiveColumnId,
    effectivePriority,
    effectiveDueDate,
    commentInput,
    editingCommentId,
    editingCommentContent,
    isDeleteModalOpen,
    isCreatingComment: createCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isSavingMainFields: updateMainTicketMutation.isPending,
    isDeletingTicket: deleteTicketMutation.isPending,
    isUpdatingAssignees:
      assignTicketMutation.isPending || unassignTicketMutation.isPending,
    isTicketArchived,
    isUnarchivingTicket: updateMainTicketMutation.isPending,
    setTitleDraft,
    setDescriptionDraft,
    setColumnIdDraft,
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
    handleUnarchiveTicket,
  };
};
