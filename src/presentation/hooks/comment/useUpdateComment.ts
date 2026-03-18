import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateCommentInput } from "@/domains/project-management/core/domain/schema/comment.schema";

import { updateComment } from "@/domains/project-management/core/usecases/comment";

import { commentRepository } from "@/domains/project-management/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

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
