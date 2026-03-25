import type {
  TicketFilters,
  TicketSort,
} from "@/modules/board/core/domain/schema/ticket.schema";
import {
  createTicketListFilterKey,
  createTicketListSortKey,
} from "@/modules/board/presentation/hooks/queryKeys.mapper";

/**
 * Centralized query key factory for React Query.
 * Provides type-safe query keys following hierarchical pattern.
 *
 * Query keys are used to:
 * - Identify and cache queries in React Query
 * - Invalidate/refetch related queries after mutations
 * - Ensure type safety when working with query keys across the app
 *
 * This file is separate from the hooks because:
 * - Hooks contain React Query logic (queryFn, enabled, etc.)
 * - Query keys are just identifiers used by both hooks AND mutation invalidations
 * - Centralizing keys prevents typos and ensures consistency
 * - Mutations can invalidate queries without importing the hooks themselves
 */
const queryKeysObject = {
  projects: {
    all: () => ["projects"] as const,
    withStats: () => ["projects", "with-stats"] as const,
    reclaimable: () => ["projects", "reclaimable"] as const,
    detail: (id: string) => ["projects", id] as const,
    shortCode: (id: string) => ["projects", id, "short-code"] as const,
    currentRole: (projectId: string) =>
      ["projects", projectId, "permissions", "role"] as const,
    ticketsRoot: (projectId: string) =>
      ["projects", projectId, "tickets"] as const,
    ticketsList: (
      projectId: string,
      filters?: TicketFilters,
      sort?: TicketSort,
      search?: string,
      limit?: number
    ) => {
      return [
        "projects",
        projectId,
        "tickets",
        "list",
        createTicketListFilterKey(filters),
        createTicketListSortKey(sort),
        search?.trim() || null,
        limit ?? null,
      ] as const;
    },
    epicsRoot: (projectId: string) => ["projects", projectId, "epics"] as const,
    epicsList: (projectId: string) =>
      ["projects", projectId, "epics", "list"] as const,
    boardConfiguration: (projectId: string) =>
      ["projects", projectId, "board", "configuration"] as const,
  },
  tickets: {
    detail: (id: string) => ["tickets", id] as const,
    assigneesRoot: () => ["ticket-assignees"] as const,
    assignees: (ticketId: string) => ["ticket-assignees", ticketId] as const,
    assigneesByProjectId: (projectId: string) =>
      ["ticket-assignees", "project", projectId] as const,
    assigneesByTicketIds: (ticketIds: string[]) =>
      ["ticket-assignees", "batch", ...[...ticketIds].sort()] as const,
  },
  epics: {
    all: () => ["epics"] as const,
    detail: (id: string) => ["epics", id] as const,
  },
  comments: {
    root: () => ["comments"] as const,
    byTicket: (ticketId: string) => ["comments", "ticket", ticketId] as const,
    byProject: (projectId: string) => ["comments", "project", projectId] as const,
  },
  labels: {
    root: () => ["labels"] as const,
    byProject: (projectId: string) => ["labels", "project", projectId] as const,
    byTicket: (ticketId: string) => ["labels", "ticket", ticketId] as const,
  },
  subscription: {
    current: () => ["subscription", "current"] as const,
  },
  invitations: {
    byProject: (projectId: string) =>
      ["invitations", "project", projectId] as const,
    pending: () => ["invitations", "pending"] as const,
  },
  members: {
    byProject: (projectId: string) =>
      ["members", "project", projectId] as const,
  },
  userProfiles: {
    detail: (userId: string) => ["user-profiles", userId] as const,
    byIds: (userIds: string[]) =>
      ["user-profiles", "batch", ...userIds.sort()] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  projects: Object.freeze(queryKeysObject.projects),
  tickets: Object.freeze(queryKeysObject.tickets),
  epics: Object.freeze(queryKeysObject.epics),
  comments: Object.freeze(queryKeysObject.comments),
  labels: Object.freeze(queryKeysObject.labels),
  invitations: Object.freeze(queryKeysObject.invitations),
  members: Object.freeze(queryKeysObject.members),
  subscription: Object.freeze(queryKeysObject.subscription),
  userProfiles: Object.freeze(queryKeysObject.userProfiles),
});
