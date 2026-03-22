const queryKeysObject = {
  projects: {
    withStats: () => ["projects", "with-stats"] as const,
    reclaimable: () => ["projects", "reclaimable"] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  projects: Object.freeze(queryKeysObject.projects),
});
