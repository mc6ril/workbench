/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";

type CookieConfig = Parameters<typeof createServerClient>[2]["cookies"];

const mockGetClaims = jest.fn();
let cookieConfig: CookieConfig | null = null;

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn((_url, _key, options) => {
    cookieConfig = options.cookies;

    return {
      auth: {
        getClaims: () => mockGetClaims(),
      },
    };
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports -- load after mock
const { proxy } = require("../../src/proxy") as {
  proxy: (request: NextRequest) => Promise<import("next/server").NextResponse>;
};

const baseUrl = "https://app.example.com";

const createRequest = (
  pathname: string,
  init?: {
    cookies?: Record<string, string>;
    search?: string;
  }
): NextRequest => {
  const url = new URL(pathname + (init?.search ?? ""), baseUrl);
  const request = new NextRequest(url);

  if (init?.cookies) {
    for (const [name, value] of Object.entries(init.cookies)) {
      request.cookies.set(name, value);
    }
  }

  return request;
};

describe("proxy", () => {
  beforeEach(() => {
    cookieConfig = null;
    mockGetClaims.mockReset();
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: null,
    });
  });

  it("creates the Supabase server client with the configured publishable default key", async () => {
    await proxy(createRequest(PAGE_ROUTES.HOME));

    expect(createServerClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      expect.objectContaining({
        cookies: expect.any(Object),
      })
    );
  });

  it("lets public routes pass without an authenticated user", async () => {
    const homeResponse = await proxy(createRequest(PAGE_ROUTES.HOME));
    const pricingResponse = await proxy(createRequest(PAGE_ROUTES.PRICING));
    const signinResponse = await proxy(createRequest(AUTH_PAGE_ROUTES.SIGNIN));

    expect(homeResponse.status).toBe(200);
    expect(pricingResponse.status).toBe(200);
    expect(signinResponse.status).toBe(200);
    expect(homeResponse.headers.get("location")).toBeNull();
    expect(pricingResponse.headers.get("location")).toBeNull();
    expect(signinResponse.headers.get("location")).toBeNull();
    expect(mockGetClaims).toHaveBeenCalledTimes(3);
  });

  it("redirects unauthenticated protected routes to auth signin with a redirect param", async () => {
    const response = await proxy(createRequest(PAGE_ROUTES.WORKSPACE));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `${baseUrl}${AUTH_PAGE_ROUTES.SIGNIN}?redirect=%2Fworkspace`
    );
  });

  it("preserves Supabase cookies when redirecting to signin", async () => {
    mockGetClaims.mockImplementation(async () => {
      expect(cookieConfig?.setAll).toBeDefined();
      cookieConfig!.setAll!(
        [
          {
            name: "sb-workbench-auth-token",
            value: "refreshed-token",
            options: {
              path: "/",
              sameSite: "lax",
            },
          },
        ],
        {
          "x-supabase-refresh": "1",
        }
      );

      return {
        data: { claims: null },
        error: null,
      };
    });

    const request = createRequest(PAGE_ROUTES.WORKSPACE);
    const response = await proxy(request);

    expect(request.cookies.get("sb-workbench-auth-token")?.value).toBe(
      "refreshed-token"
    );
    expect(response.headers.get("set-cookie")).toContain(
      "sb-workbench-auth-token=refreshed-token"
    );
    expect(response.headers.get("x-supabase-refresh")).toBe("1");
  });

  it("redirects authenticated signin and signup visits to workspace", async () => {
    mockGetClaims.mockResolvedValue({
      data: {
        claims: {
          sub: "123e4567-e89b-12d3-a456-426614174000",
          email: "test@example.com",
          app_metadata: {},
        },
      },
      error: null,
    });

    const signinResponse = await proxy(createRequest(AUTH_PAGE_ROUTES.SIGNIN));
    const signupResponse = await proxy(createRequest(AUTH_PAGE_ROUTES.SIGNUP));

    expect(signinResponse.status).toBe(307);
    expect(signinResponse.headers.get("location")).toBe(
      `${baseUrl}${PAGE_ROUTES.WORKSPACE}`
    );
    expect(signupResponse.status).toBe(307);
    expect(signupResponse.headers.get("location")).toBe(
      `${baseUrl}${PAGE_ROUTES.WORKSPACE}`
    );
  });

  it("lets protected routes pass when getClaims returns authenticated claims", async () => {
    mockGetClaims.mockResolvedValue({
      data: {
        claims: {
          sub: "123e4567-e89b-12d3-a456-426614174000",
          email: "test@example.com",
          app_metadata: {},
        },
      },
      error: null,
    });

    const response = await proxy(createRequest(PAGE_ROUTES.WORKSPACE));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
