export type Comment = {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Comment enriched with author profile data.
 * Used when displaying comments in the ticket detail view.
 */
export type CommentWithAuthor = Comment & {
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
};

export type CreateCommentInput = {
  ticketId: string;
  content: string;
};

export type UpdateCommentInput = {
  content: string;
};

