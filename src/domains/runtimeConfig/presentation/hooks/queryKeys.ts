const queryKeysObject = {
  runtimeConfig: {
    boolean: (key: string) => ["runtime-config", "boolean", key] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  runtimeConfig: Object.freeze(queryKeysObject.runtimeConfig),
});
