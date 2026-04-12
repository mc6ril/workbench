const queryKeysObject = {
  runtimeConfig: {
    boolean: (key: string, evaluationTag = "standard") =>
      ["runtime-config", "boolean", key, evaluationTag] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  runtimeConfig: Object.freeze(queryKeysObject.runtimeConfig),
});
