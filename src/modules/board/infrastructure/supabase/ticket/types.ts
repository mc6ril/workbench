import type { RpcRow, TableRow } from "@/shared/infrastructure/supabase/types";

export type TicketRow = TableRow<"tickets">;
export type TicketAssigneeRow = RpcRow<"get_ticket_assignees">;

export type TicketSearchRow = Pick<TicketRow, "id" | "title" | "code_number">;
