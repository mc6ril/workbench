import type { TicketFilters, TicketSort } from "@/core/domain/schema/ticket.schema";

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
  auth: {
    session: () => ["auth", "session"] as const,
    user: () => ["auth", "user"] as const,
  },
  projects: {
    all: () => ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
    ticketsRoot: (projectId: string) =>
      ["projects", projectId, "tickets"] as const,
    ticketsList: (
      projectId: string,
      filters?: TicketFilters,
      sort?: TicketSort
    ) => {
      // Create stable query keys by extracting filter/sort values
      // This ensures identical values create the same key regardless of object reference.
      const filterKey = filters
        ? [
            filters.status ?? null,
            filters.epicId ?? null,
            filters.parentId ?? null,
          ]
        : null;
      const sortKey = sort ? [sort.field, sort.direction] : null;

      return ["projects", projectId, "tickets", "list", filterKey, sortKey] as const;
    },
    epicsRoot: (projectId: string) => ["projects", projectId, "epics"] as const,
    epicsList: (projectId: string) =>
      ["projects", projectId, "epics", "list"] as const,
    boardConfiguration: (projectId: string) =>
      ["projects", projectId, "board", "configuration"] as const,
  },
  tickets: {
    all: () => ["tickets"] as const,
    byProject: (projectId: string) =>
      ["tickets", "project", projectId] as const,
    detail: (id: string) => ["tickets", id] as const,
    byStatus: (projectId: string, status: string) =>
      ["tickets", "project", projectId, "status", status] as const,
  },
  epics: {
    all: () => ["epics"] as const,
    detail: (id: string) => ["epics", id] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  auth: Object.freeze(queryKeysObject.auth),
  projects: Object.freeze(queryKeysObject.projects),
  tickets: Object.freeze(queryKeysObject.tickets),
  epics: Object.freeze(queryKeysObject.epics),
});
