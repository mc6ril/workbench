import type { CommentWithAuthor } from "@/modules/board/core/domain/schema/comment.schema";

import type { CommentWithAuthorRow } from "@/shared/infrastructure/types";

import { toDate } from "@/shared/utils/guards";

/**
 * Maps a Supabase RPC row (with author profile) to a domain CommentWithAuthor entity.
 */
export const mapCommentWithAuthorRowToDomain = (
  row: CommentWithAuthorRow
): CommentWithAuthor => {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    authorId: row.author_id,
    content: row.content,
    authorDisplayName: row.author_display_name,
    authorAvatarUrl: row.author_avatar_url,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};

export const mapCommentWithAuthorRowsToDomain = (
  rows: CommentWithAuthorRow[]
): CommentWithAuthor[] => {
  return rows.map(mapCommentWithAuthorRowToDomain);
};
