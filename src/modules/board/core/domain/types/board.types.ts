import type { ColumnWorkflowState } from "@/modules/board/core/domain/schema/board.schema";
import type { TicketPriority } from "@/modules/board/core/domain/schema/ticket.schema";

export type BoardColumnConfig = {
  id: string;
  title: string;
  key?: string;
  state: ColumnWorkflowState;
  isVisible?: boolean;
};

export type BoardTicketViewModel = {
  id: string;
  title: string;
  ticketCode?: string | null;
  columnId?: string;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  priority?: TicketPriority | null;
  storyPoints?: number | null;
};
