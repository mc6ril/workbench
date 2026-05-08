const queryKeysObject = {
  authIdentity: {
    current: () => ["auth", "identity", "current"] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  authIdentity: Object.freeze(queryKeysObject.authIdentity),
});
