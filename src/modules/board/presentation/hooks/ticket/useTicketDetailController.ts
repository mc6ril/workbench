import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { buildProjectRoute } from "@/shared/utils/routes";

import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions";
import { useSession } from "@/domains/session/presentation/hooks/useSession";
import type { TicketPriority } from "@/modules/board/core/domain/schema/ticket.schema";
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
  const [statusDraft, setStatusDraft] = useState<string | null>(null);
  const [priorityDraft, setPriorityDraft] = useState<TicketPriority | "" | null>(
    null
  );
  const [dueDateDraft, setDueDateDraft] = useState<Date | null | undefined>(
    undefined
  );
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const statusOptions = useMemo<TicketDetailStatusOption[]>(() => {
    const columns = boardConfiguration?.columns ?? [];
    return columns.map((column) => ({
      value: column.status,
      label: column.name,
      state: column.state,
    }));
  }, [boardConfiguration?.columns]);

  const effectiveTitle = titleDraft ?? ticket?.title ?? "";
  const effectiveDescription = descriptionDraft ?? ticket?.description ?? "";
  const effectiveStatus = statusDraft ?? ticket?.status ?? "";
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
        status: effectiveStatus || undefined,
        priority: (effectivePriority as TicketPriority) || null,
        dueDate: effectiveDueDate,
        position: ticket.position,
      },
    });

    setTitleDraft(null);
    setDescriptionDraft(null);
    setStatusDraft(null);
    setPriorityDraft(null);
    setDueDateDraft(undefined);
  }, [
    canEditTicket,
    effectiveDescription,
    effectiveDueDate,
    effectivePriority,
    effectiveStatus,
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
    effectiveStatus,
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
  };
};
