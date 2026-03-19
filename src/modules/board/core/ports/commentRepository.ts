import type {
  CommentWithAuthor,
  CreateCommentInput,
  UpdateCommentInput,
} from "@/modules/board/core/domain/schema/comment.schema";

/**
 * Repository contract for Comment operations.
 *
 * Comments are attached to tickets. Only the author can edit their own comments.
 * Admins and authors can delete comments. All project members can read comments.
 */
export type CommentRepository = {
  /**
   * List all comments for a ticket with author profile data.
   * Ordered by creation date ascending (oldest first).
   */
  listByTicket(ticketId: string): Promise<CommentWithAuthor[]>;

  /**
   * Create a new comment on a ticket.
   * Author is set from the current authenticated user.
   */
  create(input: CreateCommentInput): Promise<CommentWithAuthor>;

  /**
   * Update an existing comment's content.
   * Only the author can update their own comment (enforced by RLS).
   * @throws NotFoundError if comment not found
   */
  update(id: string, input: UpdateCommentInput): Promise<CommentWithAuthor>;

  /**
   * Delete a comment.
   * Only the author or project admins can delete (enforced by RLS).
   */
  delete(id: string): Promise<void>;
};
