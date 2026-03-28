import type { NextRequest } from "next/server";

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
  createAuthRepository: jest.fn(),
}));

jest.mock("@/domains/session/infrastructure/supabase/repositories", () => ({
  createSessionRepository: jest.fn(),
}));

jest.mock("@/domains/session/core/usecases/getCurrentSession", () => ({
  getCurrentSession: jest.fn(),
}));

jest.mock("@/domains/auth/core/usecases/user/deleteUser", () => ({
  deleteUser: jest.fn(),
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
import { deleteUser } from "@/domains/auth/core/usecases/user/deleteUser";
import { createAuthRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionRepository } from "@/domains/session/infrastructure/supabase/repositories";

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
      .mocked(createSessionRepository)
      .mockReturnValue({} as ReturnType<typeof createSessionRepository>);
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
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("deletes the authenticated user with the admin-enabled repository", async () => {
    const serverClient = {} as Awaited<
      ReturnType<typeof createSupabaseServerClient>
    >;
    const adminClient = {} as ReturnType<typeof createSupabaseAdminClient>;
    const sessionRepository = {} as ReturnType<typeof createSessionRepository>;
    const authRepository = {} as ReturnType<typeof createAuthRepository>;

    jest.mocked(createSupabaseServerClient).mockResolvedValue(serverClient);
    jest.mocked(createSessionRepository).mockReturnValue(sessionRepository);
    jest.mocked(getCurrentSession).mockResolvedValue({
      userId: "user-123",
      loginEmail: "user@example.com",
      accessToken: "",
      isSuperuser: false,
    });
    jest.mocked(createSupabaseAdminClient).mockReturnValue(adminClient);
    jest.mocked(createAuthRepository).mockReturnValue(authRepository);
    jest.mocked(deleteUser).mockResolvedValue(undefined);

    const response = (await DELETE(
      createRequest()
    )) as unknown as MockNextResponse;

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: "User deleted successfully",
    });
    expect(createAuthRepository).toHaveBeenCalledWith(
      serverClient,
      adminClient
    );
    expect(deleteUser).toHaveBeenCalledWith(authRepository);
  });
});
