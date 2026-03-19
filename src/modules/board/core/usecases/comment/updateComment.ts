import type {
  CommentWithAuthor,
  UpdateCommentInput,
} from "@/modules/board/core/domain/schema/comment.schema";
import { UpdateCommentInputSchema } from "@/modules/board/core/domain/schema/comment.schema";

import type { CommentRepository } from "@/modules/board/core/ports/commentRepository";

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
