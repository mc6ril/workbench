import type { QueryClient } from "@tanstack/react-query";

import { isBoolean, isString } from "@/shared/utils";

import {
  type UserProfile,
  UserProfileSchema,
} from "@/domains/profile/core/domain/profile.types";
import { queryKeys as profileQueryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import { queryKeys as sessionQueryKeys } from "@/domains/session/presentation/hooks/queryKeys";

const IDENTITY_CACHE_STORAGE_KEY = "workbench.identity-cache.v1";

type PersistedUserProfile = Omit<
  UserProfile,
  "termsAcceptedAt" | "createdAt" | "updatedAt"
> & {
  termsAcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PersistedIdentityCache = {
  session: CurrentSession;
  profile?: PersistedUserProfile;
};

const isBrowser = (): boolean => typeof window !== "undefined";

const isPersistedCurrentSession = (value: unknown): value is CurrentSession => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isString(candidate.userId) &&
    isString(candidate.loginEmail) &&
    isString(candidate.accessToken) &&
    isBoolean(candidate.isSuperuser)
  );
};

const serializeUserProfile = (profile: UserProfile): PersistedUserProfile => {
  return {
    ...profile,
    termsAcceptedAt: profile.termsAcceptedAt?.toISOString() ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
};

const deserializeUserProfile = (value: unknown): UserProfile | null => {
  try {
    return UserProfileSchema.parse(value);
  } catch {
    return null;
  }
};

const readPersistedIdentityCache = (): PersistedIdentityCache | null => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(IDENTITY_CACHE_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      session?: unknown;
      profile?: unknown;
    };

    if (!isPersistedCurrentSession(parsed.session)) {
      return null;
    }

    const profile = deserializeUserProfile(parsed.profile);

    return profile
      ? {
          session: {
            ...parsed.session,
            accessToken: "",
          },
          profile: serializeUserProfile(profile),
        }
      : {
          session: {
            ...parsed.session,
            accessToken: "",
          },
        };
  } catch {
    return null;
  }
};

const writePersistedIdentityCache = (value: PersistedIdentityCache): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    const nextValue = JSON.stringify(value);
    const currentValue = window.localStorage.getItem(
      IDENTITY_CACHE_STORAGE_KEY
    );

    if (currentValue === nextValue) {
      return;
    }

    window.localStorage.setItem(IDENTITY_CACHE_STORAGE_KEY, nextValue);
  } catch {
    // Ignore storage write failures and fall back to in-memory React Query cache.
  }
};

export const clearPersistedIdentityCache = (): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(IDENTITY_CACHE_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
};

export const hydratePersistedIdentityCache = (
  queryClient: QueryClient
): void => {
  const snapshot = readPersistedIdentityCache();

  if (!snapshot?.session) {
    return;
  }

  queryClient.setQueryData(sessionQueryKeys.session.current(), {
    ...snapshot.session,
    accessToken: "",
  } satisfies CurrentSession);

  if (!snapshot.profile) {
    return;
  }

  const profile = deserializeUserProfile(snapshot.profile);

  if (!profile || profile.id !== snapshot.session.userId) {
    return;
  }

  queryClient.setQueryData(
    profileQueryKeys.userProfiles.detail(snapshot.session.userId),
    profile
  );
};

export const syncPersistedIdentityCache = (queryClient: QueryClient): void => {
  const sessionState = queryClient.getQueryState<CurrentSession>(
    sessionQueryKeys.session.current()
  );

  if (sessionState?.status === "error") {
    clearPersistedIdentityCache();
    return;
  }

  const session = queryClient.getQueryData<CurrentSession>(
    sessionQueryKeys.session.current()
  );

  if (!session?.userId) {
    clearPersistedIdentityCache();
    return;
  }

  const profile = queryClient.getQueryData<UserProfile>(
    profileQueryKeys.userProfiles.detail(session.userId)
  );

  writePersistedIdentityCache({
    session: {
      ...session,
      accessToken: "",
    },
    profile:
      profile && profile.id === session.userId
        ? serializeUserProfile(profile)
        : undefined,
  });
};
