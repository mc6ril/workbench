const queryKeysObject = {
  projects: {
    all: () => ["projects"] as const,
    withStats: () => ["projects", "with-stats"] as const,
    reclaimable: () => ["projects", "reclaimable"] as const,
    detail: (id: string) => ["projects", id] as const,
    currentRole: (projectId: string) =>
      ["projects", projectId, "permissions", "role"] as const,
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
  invitations: Object.freeze(queryKeysObject.invitations),
  members: Object.freeze(queryKeysObject.members),
});
