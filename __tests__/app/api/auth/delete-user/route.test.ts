import type { NextRequest } from "next/server";

import { AUTH_ERROR_CODE } from "@/shared/errors/appErrorCodes";

import { DEFAULT_USER_PREFERENCES } from "@/domains/profile/core/domain/profile.types";

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

jest.mock("@/shared/infrastructure/supabase/server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("@/shared/infrastructure/supabase/admin", () => ({
  createSupabaseAdminClient: jest.fn(),
}));

jest.mock("@/domains/auth/infrastructure/supabase/repositories", () => ({
  createAuthGateway: jest.fn(),
}));

jest.mock("@/domains/auth/infrastructure/supabase/currentAuthIdentity", () => ({
  requireCurrentAuthIdentity: jest.fn(),
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

import { createSupabaseAdminClient } from "@/shared/infrastructure/supabase/admin";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import { DELETE } from "@/app/api/auth/delete-user/route";
import { deleteAccount } from "@/domains/auth/core/usecases/user/deleteAccount";
import { requireCurrentAuthIdentity } from "@/domains/auth/infrastructure/supabase/currentAuthIdentity";
import { createAuthGateway } from "@/domains/auth/infrastructure/supabase/repositories";

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
      .mocked(requireCurrentAuthIdentity)
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
    const authGateway = {} as ReturnType<typeof createAuthGateway>;

    jest.mocked(createSupabaseServerClient).mockResolvedValue(serverClient);
    jest.mocked(requireCurrentAuthIdentity).mockResolvedValue({
      userId: "user-123",
      loginEmail: "user@example.com",
      canUpdatePassword: true,
      displayName: null,
      avatarUrl: null,
      preferences: DEFAULT_USER_PREFERENCES,
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
    const authGateway = {} as ReturnType<typeof createAuthGateway>;

    jest.mocked(createSupabaseServerClient).mockResolvedValue(serverClient);
    jest.mocked(requireCurrentAuthIdentity).mockResolvedValue({
      userId: "user-123",
      loginEmail: "user@example.com",
      canUpdatePassword: true,
      displayName: null,
      avatarUrl: null,
      preferences: DEFAULT_USER_PREFERENCES,
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
