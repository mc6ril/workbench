/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { localeCookieName } from "@/shared/i18n/config";

const mockGetUser = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: () => mockGetUser(),
    },
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports -- load after mock
const { middleware } = require("../../middleware") as {
  middleware: (request: NextRequest) => Promise<import("next/server").NextResponse>;
};

const baseUrl = "https://app.example.com";

const createRequest = (
  pathname: string,
  init?: {
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    search?: string;
  }
): NextRequest => {
  const url = new URL(pathname + (init?.search ?? ""), baseUrl);
  const headers = new Headers(init?.headers ?? {});
  const request = new NextRequest(url, { headers });
  if (init?.cookies) {
    for (const [name, value] of Object.entries(init.cookies)) {
      request.cookies.set(name, value);
    }
  }
  return request;
};

describe("middleware", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
  });

  it("redirects internal /marketing paths to public URLs", async () => {
    const res = await middleware(createRequest("/marketing/fr/pricing"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${baseUrl}/fr/pricing`);
  });

  it("redirects legacy /fr marketing prefix to canonical unprefixed paths", async () => {
    const res = await middleware(createRequest("/fr/pricing"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${baseUrl}/pricing`);
  });

  it("persists locale cookie from marketing URL (en)", async () => {
    const res = await middleware(
      createRequest("/en/pricing", {
        headers: { "accept-language": "de-DE" },
      })
    );
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain(`${localeCookieName}=en`);
  });

  it("passes through when locale cookie is set on auth route (server reads header in RSC)", async () => {
    const res = await middleware(
      createRequest("/auth/signin", {
        cookies: { [localeCookieName]: "es" },
        headers: { "accept-language": "en-US" },
      })
    );
    expect(res.status).toBe(200);
    // x-next-locale is forwarded on the request object, not echoed on Response headers in tests.
  });

  it("returns success for auth signin with Accept-Language (locale resolved in RSC)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    const res = await middleware(
      createRequest("/auth/signin", {
        headers: { "accept-language": "en-GB,en;q=0.9" },
      })
    );
    expect(res.status).toBe(200);
  });

  it("redirects OAuth code on marketing home to auth callback", async () => {
    const res = await middleware(
      createRequest("/", {
        search: "?code=abc123&type=signup",
      })
    );
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/auth/callback");
    expect(location).toContain("code=abc123");
  });

  it("redirects authenticated user away from signin", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { email_confirmed_at: "2024-01-01T00:00:00Z" },
      },
      error: null,
    });
    const res = await middleware(createRequest("/auth/signin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${baseUrl}${PAGE_ROUTES.WORKSPACE}`);
  });

  it("redirects unauthenticated user from protected route to signin with redirect param", async () => {
    const res = await middleware(createRequest("/workspace"));
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain(AUTH_PAGE_ROUTES.SIGNIN);
    expect(location).toContain("redirect=%2Fworkspace");
  });
});
