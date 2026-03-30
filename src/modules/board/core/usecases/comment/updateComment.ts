import { z } from "zod";

import type {
  CommentWithAuthor,
  UpdateCommentInput,
} from "@/modules/board/core/domain/comment.types";
import type { CommentRepository } from "@/modules/board/core/ports/commentRepository";

const UpdateCommentInputSchema = z.object({
  content: z.string().min(1, "Comment content must not be empty"),
});

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
