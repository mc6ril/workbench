import type { SupabaseClient } from "@supabase/supabase-js";

import { mockCurrentSession } from "../../../../__mocks__/core/domain/sessionMocks";
import { createSupabaseClientMock } from "../../../../__mocks__/infrastructure/supabase/supabaseClientMock";

import { createSessionGateway } from "@/domains/session/infrastructure/supabase/SessionGateway.supabase";

const createAuthenticatedClaims = (overrides: Record<string, unknown> = {}) => {
  return {
    sub: mockCurrentSession.userId,
    email: mockCurrentSession.loginEmail,
    app_metadata: {},
    ...overrides,
  };
};

describe("SessionGateway.supabase", () => {
  it("returns null when getClaims has no authenticated claims", async () => {
    const getClaims = jest.fn().mockResolvedValue({
      data: { claims: null },
      error: null,
    });
    const getUser = jest.fn();
    const client = createSupabaseClientMock({
      auth: {
        getClaims,
        getUser,
      } as unknown as SupabaseClient["auth"],
    });

    const gateway = createSessionGateway(client);

    await expect(gateway.getCurrentSession()).resolves.toBeNull();
    expect(getClaims).toHaveBeenCalledTimes(1);
    expect(getUser).not.toHaveBeenCalled();
  });

  it("maps authenticated getClaims data to the current session", async () => {
    const getClaims = jest.fn().mockResolvedValue({
      data: {
        claims: createAuthenticatedClaims(),
      },
      error: null,
    });
    const getUser = jest.fn();
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
    expect(getClaims).toHaveBeenCalledTimes(1);
    expect(getUser).not.toHaveBeenCalled();
  });

  it("treats missing Supabase claims as signed out", async () => {
    const getClaims = jest.fn().mockResolvedValue({
      data: { claims: null },
      error: {
        name: "AuthSessionMissingError",
        message: "Auth session missing!",
      },
    });
    const getUser = jest.fn();
    const client = createSupabaseClientMock({
      auth: {
        getClaims,
        getUser,
      } as unknown as SupabaseClient["auth"],
    });

    const gateway = createSessionGateway(client);

    await expect(gateway.getCurrentSession()).resolves.toBeNull();
    expect(getClaims).toHaveBeenCalledTimes(1);
    expect(getUser).not.toHaveBeenCalled();
  });
});
