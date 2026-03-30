import { z } from "zod";

import type {
  CommentWithAuthor,
  CreateCommentInput,
} from "@/modules/board/core/domain/comment.types";
import type { CommentRepository } from "@/modules/board/core/ports/commentRepository";

const CreateCommentInputSchema = z.object({
  ticketId: z.string().uuid(),
  content: z.string().min(1, "Comment content must not be empty"),
});

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
