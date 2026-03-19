/**
 * Row type for the comments table.
 */
export type CommentRow = {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

/**
 * Row type returned by get_ticket_comments RPC.
 * Includes author profile data.
 */
export type CommentWithAuthorRow = {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  author_display_name: string | null;
  author_avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
