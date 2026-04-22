import { QueryClient } from "@tanstack/react-query";

import {
  clearPersistedIdentityCache,
  hydratePersistedIdentityCache,
  syncPersistedIdentityCache,
} from "@/shared/providers/persistedIdentityCache";

import type { UserProfile } from "@/domains/profile/core/domain/profile.types";
import { queryKeys as profileQueryKeys } from "@/domains/profile/presentation/hooks/queryKeys";
import type { CurrentSession } from "@/domains/session/core/domain/session.types";
import { queryKeys as sessionQueryKeys } from "@/domains/session/presentation/hooks/queryKeys";

describe("persistedIdentityCache", () => {
  const session: CurrentSession = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    loginEmail: "cyrille@example.com",
    accessToken: "secret-token",
    isSuperuser: false,
  };

  const profile: UserProfile = {
    id: session.userId,
    email: session.loginEmail,
    displayName: "Cyrille",
    avatarUrl: "https://example.com/avatar.png",
    preferences: {
      theme: "system",
      emailNotifications: true,
      language: "fr",
      gettingStartedStatus: "completed",
    },
    termsAcceptedAt: new Date("2026-01-01T10:00:00.000Z"),
    createdAt: new Date("2025-01-01T10:00:00.000Z"),
    updatedAt: new Date("2026-04-22T10:00:00.000Z"),
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("hydrates persisted session and profile into a new query client", () => {
    const sourceClient = new QueryClient();
    sourceClient.setQueryData(sessionQueryKeys.session.current(), session);
    sourceClient.setQueryData(
      profileQueryKeys.userProfiles.detail(session.userId),
      profile
    );

    syncPersistedIdentityCache(sourceClient);

    const hydratedClient = new QueryClient();
    hydratePersistedIdentityCache(hydratedClient);

    expect(
      hydratedClient.getQueryData<CurrentSession>(
        sessionQueryKeys.session.current()
      )
    ).toEqual({
      ...session,
      accessToken: "",
    });

    expect(
      hydratedClient.getQueryData<UserProfile>(
        profileQueryKeys.userProfiles.detail(session.userId)
      )
    ).toEqual(profile);
  });

  it("clears the persisted identity cache", () => {
    const sourceClient = new QueryClient();
    sourceClient.setQueryData(sessionQueryKeys.session.current(), session);

    syncPersistedIdentityCache(sourceClient);
    clearPersistedIdentityCache();

    const hydratedClient = new QueryClient();
    hydratePersistedIdentityCache(hydratedClient);

    expect(
      hydratedClient.getQueryData(sessionQueryKeys.session.current())
    ).toBeUndefined();
    expect(
      hydratedClient.getQueryData(
        profileQueryKeys.userProfiles.detail(session.userId)
      )
    ).toBeUndefined();
  });
});
