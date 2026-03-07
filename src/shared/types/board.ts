export type BoardColumnConfig = {
  id: string;
  title: string;
  status?: string;
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
