import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { useTranslations } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { buildProjectRoute } from "@/shared/utils/routes";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
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

export type AutoSaveState = "idle" | "saving" | "saved";

export const useTicketDetailController = ({
  projectId,
  ticketId,
}: UseTicketDetailControllerParams) => {
  const router = useAppRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tColumns = useTranslations("pages.board.columns");

  const { data: identity } = useAuthIdentity();
  const { canComment, canDeleteTicket, canEditTicket } =
    useProjectPermissions();
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
  const [priorityDraft, setPriorityDraft] = useState<
    TicketPriority | "" | null
  >(null);
  const [dueDateDraft, setDueDateDraft] = useState<string | null | undefined>(
    undefined
  );
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>("idle");

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    dueDateDraft === undefined ? (ticket?.dueDate ?? null) : dueDateDraft;

  const hasDirtyFields =
    titleDraft !== null ||
    descriptionDraft !== null ||
    columnIdDraft !== null ||
    priorityDraft !== null ||
    dueDateDraft !== undefined;

  const handleSaveMainFields = useCallback(async (): Promise<void> => {
    if (!ticket || !canEditTicket) {
      return;
    }

    // Snapshot the raw draft values before the async operation so we can
    // compare after the mutation resolves — the user may have typed more
    // characters during the network round-trip.
    const snapshotTitle = titleDraft;
    const snapshotDescription = descriptionDraft;
    const snapshotColumnId = columnIdDraft;
    const snapshotPriority = priorityDraft;
    const snapshotDueDate = dueDateDraft;

    const nextPriority = effectivePriority === "" ? null : effectivePriority;

    await updateMainTicketMutation.mutateAsync({
      id: ticket.id,
      input: {
        title: effectiveTitle,
        description: effectiveDescription || null,
        columnId: effectiveColumnId || undefined,
        priority: nextPriority,
        dueDate: effectiveDueDate,
        position: ticket.position,
      },
    });

    // Only clear drafts that haven't changed since the save started.
    // If the user typed during the mutation, keep the newer value so it
    // doesn't get silently discarded.
    setTitleDraft((cur) => (cur === snapshotTitle ? null : cur));
    setDescriptionDraft((cur) => (cur === snapshotDescription ? null : cur));
    setColumnIdDraft((cur) => (cur === snapshotColumnId ? null : cur));
    setPriorityDraft((cur) => (cur === snapshotPriority ? null : cur));
    setDueDateDraft((cur) => (cur === snapshotDueDate ? undefined : cur));
  }, [
    canEditTicket,
    columnIdDraft,
    descriptionDraft,
    dueDateDraft,
    effectiveColumnId,
    effectiveDescription,
    effectiveDueDate,
    effectivePriority,
    effectiveTitle,
    priorityDraft,
    ticket,
    titleDraft,
    updateMainTicketMutation,
  ]);

  // Auto-save: fires 800 ms after the last change (true inactivity debounce).
  // Every dep change resets the timer, so the save only triggers when the
  // user stops interacting for a full 800 ms.
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    if (!hasDirtyFields || !ticket || !canEditTicket || !effectiveTitle.trim())
      return;

    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveState("saving");
      try {
        await handleSaveMainFields();
        setAutoSaveState("saved");
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(
          () => setAutoSaveState("idle"),
          2000
        );
      } catch {
        setAutoSaveState("idle");
      }
    }, 800);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    hasDirtyFields,
    effectiveTitle,
    effectiveDescription,
    effectiveColumnId,
    effectivePriority,
    effectiveDueDate,
    ticket,
    canEditTicket,
    handleSaveMainFields,
  ]);

  // Keep a ref with the latest save-relevant state so the unmount cleanup can
  // read current values without stale-closure issues.
  const unmountSaveRef = useRef({
    hasDirtyFields,
    ticket,
    canEditTicket,
    effectiveTitle,
    effectiveDescription,
    effectiveColumnId,
    effectivePriority,
    effectiveDueDate,
    mutate: updateMainTicketMutation.mutate,
  });

  useEffect(() => {
    unmountSaveRef.current = {
      hasDirtyFields,
      ticket,
      canEditTicket,
      effectiveTitle,
      effectiveDescription,
      effectiveColumnId,
      effectivePriority,
      effectiveDueDate,
      mutate: updateMainTicketMutation.mutate,
    };
  });

  // On unmount (navigation away), cancel any pending timer and fire an
  // immediate save if there are unsaved changes.
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

      const {
        hasDirtyFields,
        ticket,
        canEditTicket,
        effectiveTitle,
        effectiveDescription,
        effectiveColumnId,
        effectivePriority,
        effectiveDueDate,
        mutate,
      } = unmountSaveRef.current;

      if (
        !hasDirtyFields ||
        !ticket ||
        !canEditTicket ||
        !effectiveTitle.trim()
      ) {
        return;
      }

      const nextPriority = effectivePriority === "" ? null : effectivePriority;

      mutate({
        id: ticket.id,
        input: {
          title: effectiveTitle,
          description: effectiveDescription || null,
          columnId: effectiveColumnId || undefined,
          priority: nextPriority,
          dueDate: effectiveDueDate,
          position: ticket.position,
        },
      });
    };
  }, []); // intentional empty deps: cleanup reads from ref, not closure

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
        feedback: "none",
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
    sessionUserId: identity?.userId,
    isLoading: isTicketLoading,
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
    autoSaveState,
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
