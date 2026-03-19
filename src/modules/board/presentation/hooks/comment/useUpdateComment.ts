import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateCommentInput } from "@/modules/board/core/domain/schema/comment.schema";
import { updateComment } from "@/modules/board/core/usecases/comment";
import { commentRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for updating a comment.
 */
export const useUpdateComment = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      input,
    }: {
      commentId: string;
      input: UpdateCommentInput;
    }) => updateComment(commentId, input, commentRepository),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byTicket(ticketId),
      });
    },
  });
};
