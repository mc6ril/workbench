import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import { mockCurrentAuthIdentity } from "../../../../__mocks__/core/domain/authIdentityMocks";
import { createSupabaseClientMock } from "../../../../__mocks__/infrastructure/supabase/supabaseClientMock";

import {
  getCurrentAuthIdentity,
  requireCurrentAuthIdentity,
} from "@/domains/auth/infrastructure/supabase/currentAuthIdentity";

const createAuthenticatedClaims = (overrides: Record<string, unknown> = {}) => {
  return {
    sub: mockCurrentAuthIdentity.userId,
    email: mockCurrentAuthIdentity.loginEmail,
    app_metadata: {},
    ...overrides,
  };
};

describe("currentAuthIdentity", () => {
  it("returns null when getClaims has no authenticated claims", async () => {
    const getClaims = jest.fn().mockResolvedValue({
      data: { claims: null },
      error: null,
    });
    const client = createSupabaseClientMock({
      auth: {
        getClaims,
      } as unknown as AppSupabaseClient["auth"],
    });

    await expect(getCurrentAuthIdentity(client)).resolves.toBeNull();
    expect(getClaims).toHaveBeenCalledTimes(1);
  });

  it("maps authenticated getClaims data to the current auth identity", async () => {
    const getClaims = jest.fn().mockResolvedValue({
      data: {
        claims: createAuthenticatedClaims(),
      },
      error: null,
    });
    const client = createSupabaseClientMock({
      auth: {
        getClaims,
      } as unknown as AppSupabaseClient["auth"],
    });

    await expect(getCurrentAuthIdentity(client)).resolves.toEqual(
      mockCurrentAuthIdentity
    );
    expect(getClaims).toHaveBeenCalledTimes(1);
  });

  it("throws an auth error when required identity is missing", async () => {
    const getClaims = jest.fn().mockResolvedValue({
      data: { claims: null },
      error: null,
    });
    const client = createSupabaseClientMock({
      auth: {
        getClaims,
      } as unknown as AppSupabaseClient["auth"],
    });

    await expect(requireCurrentAuthIdentity(client)).rejects.toMatchObject({
      code: "AUTHENTICATION_ERROR",
    });
  });

  it("derives password capability from auth providers", async () => {
    const getClaims = jest.fn().mockResolvedValue({
      data: {
        claims: createAuthenticatedClaims({
          app_metadata: { providers: ["google"] },
        }),
      },
      error: null,
    });
    const client = createSupabaseClientMock({
      auth: {
        getClaims,
      } as unknown as AppSupabaseClient["auth"],
    });

    await expect(getCurrentAuthIdentity(client)).resolves.toEqual({
      ...mockCurrentAuthIdentity,
      canUpdatePassword: false,
    });
  });
});
