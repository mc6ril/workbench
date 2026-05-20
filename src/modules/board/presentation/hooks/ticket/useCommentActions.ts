import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";

import {
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/modules/board/presentation/hooks/comment";

type UseCommentActionsResult = {
  commentInput: string;
  setCommentInput: Dispatch<SetStateAction<string>>;
  editingCommentId: string | null;
  editingCommentContent: string;
  setEditingCommentContent: Dispatch<SetStateAction<string>>;
  isCreatingComment: boolean;
  isUpdatingComment: boolean;
  isDeletingComment: boolean;
  handleCreateComment: () => Promise<void>;
  handleStartCommentEditing: (commentId: string, content: string) => void;
  handleCancelCommentEditing: () => void;
  handleSaveComment: (commentId: string) => Promise<void>;
  handleDeleteComment: (commentId: string) => Promise<void>;
};

export function useCommentActions(
  ticketId: string,
  canComment: boolean
): UseCommentActionsResult {
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment(ticketId);
  const deleteCommentMutation = useDeleteComment(ticketId);

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

  return {
    commentInput,
    setCommentInput,
    editingCommentId,
    editingCommentContent,
    setEditingCommentContent,
    isCreatingComment: createCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    handleCreateComment,
    handleStartCommentEditing,
    handleCancelCommentEditing,
    handleSaveComment,
    handleDeleteComment,
  };
}
