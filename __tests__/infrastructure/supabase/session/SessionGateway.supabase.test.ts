import type { SupabaseClient } from "@supabase/supabase-js";

import { mockCurrentSession } from "../../../../__mocks__/core/domain/sessionMocks";
import { createSupabaseClientMock } from "../../../../__mocks__/infrastructure/supabase/supabaseClientMock";

import { createSessionGateway } from "@/domains/session/infrastructure/supabase/SessionGateway.supabase";

const clearDocumentCookies = () => {
  document.cookie.split(";").forEach((cookieEntry) => {
    const cookieName = cookieEntry.split("=")[0]?.trim();

    if (cookieName) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
};

const createAuthenticatedUser = (overrides: Record<string, unknown> = {}) => {
  return {
    id: mockCurrentSession.userId,
    email: mockCurrentSession.loginEmail,
    app_metadata: {},
    ...overrides,
  };
};

describe("SessionGateway.supabase", () => {
  beforeEach(() => {
    clearDocumentCookies();
  });

  afterEach(() => {
    clearDocumentCookies();
  });

  it("skips browser session validation when no Supabase auth cookie is present", async () => {
    const getUser = jest.fn();
    const getClaims = jest.fn();
    const client = createSupabaseClientMock({
      auth: {
        getClaims,
        getUser,
      } as unknown as SupabaseClient["auth"],
    });

    const gateway = createSessionGateway(client);

    await expect(gateway.getCurrentSession()).resolves.toBeNull();
    expect(getClaims).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  });

  it("validates the browser session through getUser when a Supabase auth cookie exists", async () => {
    document.cookie = "sb-projectref-auth-token=session; path=/";

    const getClaims = jest.fn();
    const getUser = jest.fn().mockResolvedValue({
      data: {
        user: createAuthenticatedUser(),
      },
      error: null,
    });
    const client = createSupabaseClientMock({
      auth: {
        getClaims,
        getUser,
      } as unknown as SupabaseClient["auth"],
    });

    const gateway = createSessionGateway(client);

    await expect(gateway.getCurrentSession()).resolves.toEqual({
      ...mockCurrentSession,
      accessToken: "",
    });
    expect(getClaims).not.toHaveBeenCalled();
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it("treats missing Supabase sessions as signed out even when a stale cookie exists", async () => {
    document.cookie = "sb-projectref-auth-token.0=stale; path=/";

    const getClaims = jest.fn();
    const getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: {
        name: "AuthSessionMissingError",
        message: "Auth session missing!",
      },
    });
    const client = createSupabaseClientMock({
      auth: {
        getClaims,
        getUser,
      } as unknown as SupabaseClient["auth"],
    });

    const gateway = createSessionGateway(client);

    await expect(gateway.getCurrentSession()).resolves.toBeNull();
    expect(getClaims).not.toHaveBeenCalled();
    expect(getUser).toHaveBeenCalledTimes(1);
  });
});
