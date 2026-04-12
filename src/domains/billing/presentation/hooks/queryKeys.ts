const queryKeysObject = {
  subscription: {
    current: () => ["subscription", "current"] as const,
  },
  config: {
    billingVisibility: (evaluationTag = "standard") =>
      ["billing", "config", "visibility", evaluationTag] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  subscription: Object.freeze(queryKeysObject.subscription),
  config: Object.freeze(queryKeysObject.config),
});
