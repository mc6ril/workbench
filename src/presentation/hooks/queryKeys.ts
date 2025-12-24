/**
 * Centralized query key factory for React Query.
 * Provides type-safe query keys following hierarchical pattern.
 */
export const queryKeys = {
  auth: {
    session: () => ["auth", "session"] as const,
    user: () => ["auth", "user"] as const,
  },
  projects: {
    all: () => ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
  },
  tickets: {
    all: () => ["tickets"] as const,
    byProject: (projectId: string) =>
      ["tickets", "project", projectId] as const,
    detail: (id: string) => ["tickets", id] as const,
    byStatus: (projectId: string, status: string) =>
      ["tickets", "project", projectId, "status", status] as const,
  },
} as const;
