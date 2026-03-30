import type { CommentWithAuthor } from "@/modules/board/core/domain/comment.types";
import type { CommentRepository } from "@/modules/board/core/ports/commentRepository";

/**
 * List all comments for a ticket with author profile data.
 */
export const listComments = async (
  ticketId: string,
  repo: CommentRepository
): Promise<CommentWithAuthor[]> => {
  return repo.listByTicket(ticketId);
};
