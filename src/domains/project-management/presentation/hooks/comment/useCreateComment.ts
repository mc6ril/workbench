import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateCommentInput } from "@/domains/project-management/core/domain/schema/comment.schema";

import { createComment } from "@/domains/project-management/core/usecases/comment";

import { commentRepository } from "@/domains/project-management/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

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
