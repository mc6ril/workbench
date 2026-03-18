import type { CommentWithAuthor } from "@/domains/project-management/core/domain/schema/comment.schema";

import type { CommentRepository } from "@/domains/project-management/core/ports/commentRepository";

/**
 * List all comments for a ticket with author profile data.
 */
export const listComments = async (
  ticketId: string,
  repo: CommentRepository
): Promise<CommentWithAuthor[]> => {
  return repo.listByTicket(ticketId);
};
