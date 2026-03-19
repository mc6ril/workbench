import { z } from "zod";

/**
 * Zod schema for Comment entity.
 * Comments belong to tickets and track discussion threads.
 */
export const CommentSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  authorId: z.string().uuid(),
  content: z.string().min(1, "Comment content must not be empty"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Comment = z.infer<typeof CommentSchema>;

/**
 * Comment enriched with author profile data.
 * Used when displaying comments in the ticket detail view.
 */
export type CommentWithAuthor = Comment & {
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
};

/**
 * Input for creating a new comment.
 */
export const CreateCommentInputSchema = z.object({
  ticketId: z.string().uuid(),
  content: z.string().min(1, "Comment content must not be empty"),
});

export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;

/**
 * Input for updating an existing comment.
 */
export const UpdateCommentInputSchema = z.object({
  content: z.string().min(1, "Comment content must not be empty"),
});

export type UpdateCommentInput = z.infer<typeof UpdateCommentInputSchema>;
