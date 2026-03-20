import { queryKeys as profileQueryKeys } from "@/domains/profile/presentation/hooks/queryKeys";

const queryKeysObject = {
  auth: {
    session: () => ["auth", "session"] as const,
    user: () => ["auth", "user"] as const,
  },
  projects: {
    all: () => ["projects"] as const,
  },
  userProfiles: profileQueryKeys.userProfiles,
} as const;

export const queryKeys = Object.freeze({
  auth: Object.freeze(queryKeysObject.auth),
  projects: Object.freeze(queryKeysObject.projects),
  userProfiles: queryKeysObject.userProfiles,
});
