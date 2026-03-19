import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateCommentInput } from "@/modules/board/core/domain/schema/comment.schema";

import { createComment } from "@/modules/board/core/usecases/comment";

import { commentRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for creating a comment on a ticket.
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      createComment(input, commentRepository),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byTicket(comment.ticketId),
      });
    },
  });
};
