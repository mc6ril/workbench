import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CommentWithAuthor,
  CreateCommentInput,
} from "@/modules/board/core/domain/comment.types";
import { createComment } from "@/modules/board/core/usecases/comment/createComment";
import { commentRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for creating a comment on a ticket.
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<CommentWithAuthor, Error, CreateCommentInput>({
    mutationFn: (input: CreateCommentInput) =>
      createComment(input, commentRepository),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byTicket(comment.ticketId),
      });
    },
  });
};
