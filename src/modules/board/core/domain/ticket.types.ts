export const TICKET_PRIORITY_VALUES = ["urgent", "normal", "low"] as const;

export type TicketPriority = (typeof TICKET_PRIORITY_VALUES)[number];

export type Ticket = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  columnId: string;
  position: number;
  codeNumber: number;
  priority: TicketPriority | null;
  /** Calendar date in YYYY-MM-DD format. */
  dueDate: string | null;
  storyPoints: number | null;
  createdBy: string | null;
  completedAt: Date | null;
  archivedAt: Date | null;
  archivedWeekStart: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TicketFilters = {
  columnId?: string;
  priority?: TicketPriority;
  /** When set, only tickets assigned to this user (join on ticket_assignees). */
  assigneeUserId?: string;
  /** When true, only tickets with no assignees. */
  unassignedOnly?: boolean;
};

export type CreateTicketInput = {
  projectId: string;
  title: string;
  description?: string | null;
  columnId: string;
  position?: number;
  priority?: TicketPriority | null;
  /** Calendar date in YYYY-MM-DD format. */
  dueDate?: string | null;
  storyPoints?: number | null;
  createdBy?: string | null;
  completedAt?: Date | null;
  /** Optional override. When absent, usecases allocate next code number. */
  codeNumber?: number;
};

export type UpdateTicketInput = {
  title?: string;
  description?: string | null;
  columnId?: string;
  position?: number;
  priority?: TicketPriority | null;
  /** Calendar date in YYYY-MM-DD format. */
  dueDate?: string | null;
  storyPoints?: number | null;
  completedAt?: Date | null;
  archivedAt?: Date | null;
  archivedWeekStart?: Date | null;
};

export type ReorderTicketInput = {
  ticketPositions: Array<{
    id: string;
    position: number;
  }>;
};

export type MoveAndReorderTicketInput = {
  ticketId: string;
  columnId: string;
  position: number;
  ticketPositions: Array<{
    id: string;
    position: number;
  }>;
};

/**
 * Input for looking up a ticket by its code number within a specific project.
 * The functional key of a ticket is (projectId, codeNumber); short codes are
 * never used as a global project identifier.
 */
export type GetTicketByCodeInProjectInput = {
  projectId: string;
  codeNumber: number;
};

export type TicketIdInput = {
  id: string;
};

export type MoveTicketInput = {
  id: string;
  columnId: string;
  position: number;
};

/** A user assigned to a ticket, with their profile summary. */
export type TicketAssignee = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  assignedAt: Date;
};

/** A ticket enriched with its assignees list. */
export type TicketWithAssignees = Ticket & {
  assignees: TicketAssignee[];
};

export type AssignUsersToTicketInput = {
  ticketId: string;
  userIds: string[];
};

export type UnassignUsersFromTicketInput = {
  ticketId: string;
  userIds: string[];
};

