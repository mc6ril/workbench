const queryKeysObject = {
  userProfiles: {
    root: () => ["user-profiles"] as const,
    detail: (userId: string) => ["user-profiles", userId] as const,
  },
} as const;

export const queryKeys = Object.freeze({
  userProfiles: Object.freeze(queryKeysObject.userProfiles),
});
