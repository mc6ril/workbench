import type { ColumnWorkflowState } from "@/modules/board/core/domain/board.types";
import type { TicketPriority } from "@/modules/board/core/domain/ticket.types";

/**
 * Column configuration as consumed by board UI and DnD helpers (read model).
 */
export type BoardColumnConfig = {
  id: string;
  title: string;
  key?: string;
  state: ColumnWorkflowState;
  isVisible?: boolean;
};

/**
 * Ticket summary for board column rendering (presentation).
 */
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
