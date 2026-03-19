import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteComment } from "@/modules/board/core/usecases/comment";

import { commentRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for deleting a comment.
 */
export const useDeleteComment = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      deleteComment(commentId, commentRepository),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byTicket(ticketId),
      });
    },
  });
};
