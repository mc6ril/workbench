import type { CommentRepository } from "@/modules/board/core/ports/commentRepository";

/**
 * Delete a comment from a ticket.
 */
export const deleteComment = async (
  commentId: string,
  repo: CommentRepository
): Promise<void> => {
  return repo.delete(commentId);
};
