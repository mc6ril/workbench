const queryKeysObject = {
  auth: {
    session: () => ["auth", "session"] as const,
    user: () => ["auth", "user"] as const,
  },
  projects: {
    all: () => ["projects"] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  auth: Object.freeze(queryKeysObject.auth),
  projects: Object.freeze(queryKeysObject.projects),
});
