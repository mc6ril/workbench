import type { TicketFilters } from "@/modules/board/core/domain/ticket.types";
import { createTicketListQueryParamsKey } from "@/modules/board/presentation/hooks/queryKeys.mapper";

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
      search?: string,
      limit?: number
    ) => {
      return [
        "projects",
        projectId,
        "tickets",
        "list",
        createTicketListQueryParamsKey(filters, search, limit),
      ] as const;
    },
    ticketSearchSuggestions: (
      projectId: string,
      search?: string,
      limit?: number
    ) =>
      [
        "projects",
        projectId,
        "tickets",
        "search-suggestions",
        search?.trim() || null,
        limit ?? null,
      ] as const,
    boardConfiguration: (projectId: string) =>
      ["projects", projectId, "board", "configuration"] as const,
  },
  tickets: {
    detail: (id: string) => ["tickets", id] as const,
    byCodeInProjectIncludingArchived: (projectId: string, codeNumber: number) =>
      [
        "tickets",
        "by-code",
        "including-archived",
        projectId,
        codeNumber,
      ] as const,
    assigneesRoot: () => ["ticket-assignees"] as const,
    assignees: (ticketId: string) => ["ticket-assignees", ticketId] as const,
    assigneesByProjectId: (projectId: string) =>
      ["ticket-assignees", "project", projectId] as const,
    assigneesByTicketIds: (ticketIds: string[]) =>
      ["ticket-assignees", "batch", ...[...ticketIds].sort()] as const,
  },
  ticketAttachments: {
    root: () => ["ticket-attachments"] as const,
    byTicket: (ticketId: string) =>
      ["ticket-attachments", "ticket", ticketId] as const,
  },
  comments: {
    root: () => ["comments"] as const,
    byTicket: (ticketId: string) => ["comments", "ticket", ticketId] as const,
    byProject: (projectId: string) =>
      ["comments", "project", projectId] as const,
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
} as const;

export const queryKeys = Object.freeze({
  projects: Object.freeze(queryKeysObject.projects),
  tickets: Object.freeze(queryKeysObject.tickets),
  ticketAttachments: Object.freeze(queryKeysObject.ticketAttachments),
  comments: Object.freeze(queryKeysObject.comments),
  invitations: Object.freeze(queryKeysObject.invitations),
  members: Object.freeze(queryKeysObject.members),
});
