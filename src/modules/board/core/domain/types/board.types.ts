import type { ColumnWorkflowState } from "@/modules/board/core/domain/schema/board.schema";

export type BoardColumnConfig = {
  id: string;
  title: string;
  status?: string;
  state: ColumnWorkflowState;
  isVisible?: boolean;
};

export type BoardTicketViewModel = {
  id: string;
  title: string;
  ticketCode?: string | null;
  status?: string;
  epicName?: string | null;
  assigneeName?: string | null;
  assigneeAvatarUrl?: string | null;
  priority?: string | null;
  storyPoints?: number | null;
};
