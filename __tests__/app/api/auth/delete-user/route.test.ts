import type { NextRequest } from "next/server";

import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (
      body: unknown,
      init?: { status?: number; headers?: Record<string, string> }
    ) => ({
      status: init?.status ?? 200,
      headers: init?.headers ?? {},
      json: async () => body,
    }),
  },
}));

jest.mock("@/shared/infrastructure/web/security/csrf", () => ({
  verifyCsrfOrigin: jest.fn(() => null),
}));

jest.mock("@/shared/infrastructure/web/rateLimit", () => ({
  withRateLimit: jest.fn(() => null),
}));

jest.mock("@/shared/infrastructure/supabase/client-server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("@/shared/infrastructure/supabase/client-admin", () => ({
  createSupabaseAdminClient: jest.fn(),
}));

jest.mock("@/domains/auth/infrastructure/supabase/repositories", () => ({
  createAuthGateway: jest.fn(),
}));

jest.mock("@/domains/session/infrastructure/supabase/repositories", () => ({
  createSessionGateway: jest.fn(),
}));

jest.mock("@/domains/session/core/usecases/getCurrentSession", () => ({
  getCurrentSession: jest.fn(),
}));

jest.mock("@/domains/auth/core/usecases/user/deleteAccount", () => ({
  deleteAccount: jest.fn(),
}));

jest.mock("@/shared/observability", () => ({
  createLoggerFactory: () => ({
    forScope: () => ({
      error: jest.fn(),
      warn: jest.fn(),
    }),
  }),
}));

import { createSupabaseAdminClient } from "@/shared/infrastructure/supabase/client-admin";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { DELETE } from "@/app/api/auth/delete-user/route";
import { deleteAccount } from "@/domains/auth/core/usecases/user/deleteAccount";
import { createAuthGateway } from "@/domains/auth/infrastructure/supabase/repositories";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";

type MockNextResponse = {
  status: number;
  headers: Record<string, string>;
  json: () => Promise<unknown>;
};

const createRequest = (): NextRequest =>
  ({
    headers: {
      get: () => "https://example.com",
    },
    nextUrl: {
      origin: "https://example.com",
    },
  }) as unknown as NextRequest;

describe("DELETE /api/auth/delete-user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when the current user is not authenticated", async () => {
    jest
      .mocked(createSupabaseServerClient)
      .mockResolvedValue({} as ReturnType<typeof createSupabaseServerClient>);
    jest
      .mocked(createSessionGateway)
      .mockReturnValue({} as ReturnType<typeof createSessionGateway>);
    jest
      .mocked(getCurrentSession)
      .mockRejectedValue(new Error("Auth session missing"));

    const response = (await DELETE(
      createRequest()
    )) as unknown as MockNextResponse;

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Authentication required",
    });
    expect(createSupabaseAdminClient).not.toHaveBeenCalled();
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("deletes the authenticated user with the admin-enabled gateway", async () => {
    const serverClient = {} as Awaited<
      ReturnType<typeof createSupabaseServerClient>
    >;
    const adminClient = {} as ReturnType<typeof createSupabaseAdminClient>;
    const sessionGateway = {} as ReturnType<typeof createSessionGateway>;
    const authGateway = {} as ReturnType<typeof createAuthGateway>;

    jest.mocked(createSupabaseServerClient).mockResolvedValue(serverClient);
    jest.mocked(createSessionGateway).mockReturnValue(sessionGateway);
    jest.mocked(getCurrentSession).mockResolvedValue({
      userId: "user-123",
      loginEmail: "user@example.com",
      accessToken: "",
      isSuperuser: false,
    });
    jest.mocked(createSupabaseAdminClient).mockReturnValue(adminClient);
    jest.mocked(createAuthGateway).mockReturnValue(authGateway);
    jest.mocked(deleteAccount).mockResolvedValue(undefined);

    const response = (await DELETE(
      createRequest()
    )) as unknown as MockNextResponse;

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: "User deleted successfully",
    });
    expect(createAuthGateway).toHaveBeenCalledWith(serverClient, adminClient);
    expect(deleteAccount).toHaveBeenCalledWith(authGateway);
  });

  it("returns 500 when the auth provider fails server-side", async () => {
    const serverClient = {} as Awaited<
      ReturnType<typeof createSupabaseServerClient>
    >;
    const adminClient = {} as ReturnType<typeof createSupabaseAdminClient>;
    const sessionGateway = {} as ReturnType<typeof createSessionGateway>;
    const authGateway = {} as ReturnType<typeof createAuthGateway>;

    jest.mocked(createSupabaseServerClient).mockResolvedValue(serverClient);
    jest.mocked(createSessionGateway).mockReturnValue(sessionGateway);
    jest.mocked(getCurrentSession).mockResolvedValue({
      userId: "user-123",
      loginEmail: "user@example.com",
      accessToken: "",
      isSuperuser: false,
    });
    jest.mocked(createSupabaseAdminClient).mockReturnValue(adminClient);
    jest.mocked(createAuthGateway).mockReturnValue(authGateway);
    jest.mocked(deleteAccount).mockRejectedValue({
      code: AUTH_ERROR_CODE.AUTH_PROVIDER_SERVER_ERROR,
      debugMessage: "Database error deleting user",
    });

    const response = (await DELETE(
      createRequest()
    )) as unknown as MockNextResponse;

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to delete user",
    });
  });
});
