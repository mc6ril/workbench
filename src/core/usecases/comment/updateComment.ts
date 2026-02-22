import type {
  CommentWithAuthor,
  UpdateCommentInput,
} from "@/core/domain/schema/comment.schema";
import { UpdateCommentInputSchema } from "@/core/domain/schema/comment.schema";

import type { CommentRepository } from "@/core/ports/commentRepository";

/**
 * Update a comment's content.
 */
export const updateComment = async (
  commentId: string,
  input: UpdateCommentInput,
  repo: CommentRepository
): Promise<CommentWithAuthor> => {
  const validated = UpdateCommentInputSchema.parse(input);
  return repo.update(commentId, validated);
};
