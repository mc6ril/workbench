const queryKeysObject = {
  projects: {
    all: () => ["projects"] as const,
    withStats: () => ["projects", "with-stats"] as const,
    reclaimable: () => ["projects", "reclaimable"] as const,
    detail: (id: string) => ["projects", id] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  projects: Object.freeze(queryKeysObject.projects),
});
