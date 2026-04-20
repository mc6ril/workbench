/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { localeCookieName } from "@/shared/i18n/config";
import { buildMarketingPricingPath } from "@/shared/i18n/marketingPaths";

const mockGetUser = jest.fn();

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: () => mockGetUser(),
    },
  })),
}));

jest.mock("next-intl/middleware", () => {
  const { NextResponse } = jest.requireActual(
    "next/server"
  ) as typeof import("next/server");

  return {
    __esModule: true,
    default: (routing: {
      defaultLocale: string;
      locales: readonly string[];
      localeCookie?: { name?: string };
    }) => {
      return (request: NextRequest) => {
        const normalizePath = (value: string): string => {
          if (value.length > 1 && value.endsWith("/")) {
            return value.slice(0, -1);
          }

          return value;
        };

        const pathname = normalizePath(request.nextUrl.pathname);
        const localeCookie =
          routing.localeCookie && typeof routing.localeCookie === "object"
            ? (routing.localeCookie.name ?? "NEXT_LOCALE")
            : "NEXT_LOCALE";
        const defaultPrefix = `/${routing.defaultLocale}`;

        if (
          pathname === defaultPrefix ||
          pathname.startsWith(`${defaultPrefix}/`)
        ) {
          const canonicalPath = pathname.slice(defaultPrefix.length) || "/";
          return NextResponse.redirect(new URL(canonicalPath, request.url));
        }

        const explicitLocale = routing.locales.find((locale) => {
          if (locale === routing.defaultLocale) {
            return false;
          }

          const localePrefix = `/${locale}`;
          return (
            pathname === localePrefix || pathname.startsWith(`${localePrefix}/`)
          );
        });

        const response = NextResponse.next();

        if (explicitLocale) {
          response.cookies.set(localeCookie, explicitLocale, {
            path: "/",
            sameSite: "lax",
          });
        }

        return response;
      };
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports -- load after mock
const { middleware } = require("../../middleware") as {
  middleware: (
    request: NextRequest
  ) => Promise<import("next/server").NextResponse>;
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
    const res = await middleware(
      createRequest(`/marketing${buildMarketingPricingPath("fr")}`)
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      `${baseUrl}${buildMarketingPricingPath("fr")}`
    );
  });

  it("canonicalizes the default-locale marketing prefix", async () => {
    const res = await middleware(createRequest(`/fr${PAGE_ROUTES.PRICING}`));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      `${baseUrl}${PAGE_ROUTES.PRICING}`
    );
  });

  it("persists locale cookie from marketing URL (en)", async () => {
    const res = await middleware(
      createRequest(buildMarketingPricingPath("en"), {
        headers: { "accept-language": "de-DE" },
      })
    );
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain(`${localeCookieName}=en`);
  });

  it("redirects a first marketing visit to the preferred locale from Accept-Language", async () => {
    const res = await middleware(
      createRequest(PAGE_ROUTES.PRICING, {
        headers: { "accept-language": "en-GB,en;q=0.9" },
      })
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      `${baseUrl}${buildMarketingPricingPath("en")}`
    );
    expect(res.headers.get("set-cookie")).toContain(`${localeCookieName}=en`);
  });

  it("resets a stale locale cookie on default-locale marketing URLs", async () => {
    const res = await middleware(
      createRequest(PAGE_ROUTES.PRICING, {
        cookies: { [localeCookieName]: "en" },
        headers: { "accept-language": "en-US,en;q=0.9" },
      })
    );
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain(`${localeCookieName}=fr`);
  });

  it("keeps an explicit marketing locale URL stable even when headers prefer another language", async () => {
    const res = await middleware(
      createRequest(buildMarketingPricingPath("en"), {
        headers: { "accept-language": "es-ES,es;q=0.9" },
      })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("set-cookie")).toContain(`${localeCookieName}=en`);
  });

  it("passes through when locale cookie is set on auth route (server reads header in RSC)", async () => {
    const res = await middleware(
      createRequest(AUTH_PAGE_ROUTES.SIGNIN, {
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
      createRequest(AUTH_PAGE_ROUTES.SIGNIN, {
        headers: { "accept-language": "en-GB,en;q=0.9" },
      })
    );
    expect(res.status).toBe(200);
  });

  it("redirects OAuth code on marketing home to auth callback", async () => {
    const res = await middleware(
      createRequest(PAGE_ROUTES.HOME, {
        search: "?code=abc123&type=signup",
      })
    );
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain(AUTH_PAGE_ROUTES.CALLBACK);
    expect(location).toContain("code=abc123");
  });

  it("redirects authenticated user away from signin", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { email_confirmed_at: "2024-01-01T00:00:00Z" },
      },
      error: null,
    });
    const res = await middleware(createRequest(AUTH_PAGE_ROUTES.SIGNIN));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      `${baseUrl}${PAGE_ROUTES.WORKSPACE}`
    );
  });

  it("redirects unauthenticated user from protected route to signin with redirect param", async () => {
    const res = await middleware(createRequest(PAGE_ROUTES.WORKSPACE));
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain(AUTH_PAGE_ROUTES.SIGNIN);
    expect(location).toContain(
      `redirect=${encodeURIComponent(PAGE_ROUTES.WORKSPACE)}`
    );
  });
});
