import type {
  CommentWithAuthor,
  CreateCommentInput,
} from "@/core/domain/schema/comment.schema";
import { CreateCommentInputSchema } from "@/core/domain/schema/comment.schema";

import type { CommentRepository } from "@/core/ports/commentRepository";

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
