const queryKeysObject = {
  projects: {
    all: () => ["projects"] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  projects: Object.freeze(queryKeysObject.projects),
});
