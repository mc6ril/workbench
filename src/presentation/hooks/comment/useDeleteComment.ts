import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteComment } from "@/domains/project-management/core/usecases/comment";

import { commentRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

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
