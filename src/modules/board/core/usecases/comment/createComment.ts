import type {
  CommentWithAuthor,
  CreateCommentInput,
} from "@/modules/board/core/domain/schema/comment.schema";
import { CreateCommentInputSchema } from "@/modules/board/core/domain/schema/comment.schema";

import type { CommentRepository } from "@/modules/board/core/ports/commentRepository";

/**
 * Create a new comment on a ticket.
 */
export const createComment = async (
  input: CreateCommentInput,
  repo: CommentRepository
): Promise<CommentWithAuthor> => {
  const validated = CreateCommentInputSchema.parse(input);
  return repo.create(validated);
};
