/** @jest-environment node */

import type { SupabaseClient } from "@supabase/supabase-js";

import { mockCurrentSession } from "../../../../__mocks__/core/domain/sessionMocks";
import { createSupabaseClientMock } from "../../../../__mocks__/infrastructure/supabase/supabaseClientMock";

import { createSessionGateway } from "@/domains/session/infrastructure/supabase/SessionGateway.supabase";

describe("SessionGateway.supabase (server)", () => {
  it("uses verified claims on the server to resolve the current session", async () => {
    const getClaims = jest.fn().mockResolvedValue({
      data: {
        claims: {
          sub: mockCurrentSession.userId,
          email: mockCurrentSession.loginEmail,
          app_metadata: {},
        },
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
    });
    expect(getClaims).toHaveBeenCalledTimes(1);
    expect(getUser).not.toHaveBeenCalled();
  });
});
