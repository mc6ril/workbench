import type { RpcRow, TableRow } from "@/shared/infrastructure/supabase/types";

export type CommentRow = TableRow<"comments">;
export type CommentWithAuthorRow = RpcRow<"get_ticket_comments">;
