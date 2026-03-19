const queryKeysObject = {
  subscription: {
    current: () => ["subscription", "current"] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  subscription: Object.freeze(queryKeysObject.subscription),
});
