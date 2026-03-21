const queryKeysObject = {
  session: {
    current: () => ["session", "current"] as const,
    passwordCapability: () => ["session", "password-capability"] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  session: Object.freeze(queryKeysObject.session),
});
