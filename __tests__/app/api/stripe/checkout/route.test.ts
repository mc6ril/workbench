/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { API_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import { localeCookieName } from "@/shared/i18n/config";
import { buildMarketingPricingPath } from "@/shared/i18n/marketingPaths";
import { APP_COOKIE_KEYS } from "@/shared/infrastructure/storage/cookies";

jest.mock("@/shared/infrastructure/web/security/csrf", () => ({
  verifyCsrfOrigin: jest.fn(() => null),
}));

jest.mock("@/shared/infrastructure/web/rateLimit", () => ({
  withRateLimit: jest.fn(() => null),
}));

jest.mock("@/shared/infrastructure/supabase/server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock(
  "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase",
  () => ({
    createBillingVisibilityPort: jest.fn(),
  })
);

jest.mock("@/domains/billing/core/usecases/getBillingVisibility", () => ({
  getBillingVisibility: jest.fn(),
}));

jest.mock("@/domains/session/infrastructure/supabase/repositories", () => ({
  createSessionGateway: jest.fn(),
}));

jest.mock("@/domains/session/core/usecases/getCurrentSession", () => ({
  getCurrentSession: jest.fn(),
}));

jest.mock("@/domains/billing/infrastructure/supabase/repositories", () => ({
  createSubscriptionRepository: jest.fn(),
}));

jest.mock("@/domains/billing/core/usecases/createCheckoutSession", () => ({
  createCheckoutSession: jest.fn(),
}));

jest.mock(
  "@/domains/billing/infrastructure/stripe/stripePaymentGateway",
  () => ({
    stripePaymentGateway: { provider: "stripe" },
  })
);

jest.mock("@/shared/observability", () => ({
  createLoggerFactory: () => ({
    forScope: () => ({
      error: jest.fn(),
      warn: jest.fn(),
    }),
  }),
}));

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import { POST } from "@/app/api/stripe/checkout/route";
import { createCheckoutSession } from "@/domains/billing/core/usecases/createCheckoutSession";
import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { createBillingVisibilityPort } from "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase";
import { createSubscriptionRepository } from "@/domains/billing/infrastructure/supabase/repositories";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";

const createRequest = ({
  body = { plan: "pro" },
  headers,
}: {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
} = {}) => {
  return new NextRequest(`https://example.com${API_ROUTES.STRIPE.CHECKOUT}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
};

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const supabaseClient = { tag: "supabase" };

    jest
      .mocked(createSupabaseServerClient)
      .mockResolvedValue(supabaseClient as never);
    jest
      .mocked(createBillingVisibilityPort)
      .mockReturnValue({ tag: "billingVisibilityPort" } as never);
    jest.mocked(getBillingVisibility).mockResolvedValue(true);
    jest
      .mocked(createSessionGateway)
      .mockReturnValue({ tag: "sessionGateway" } as never);
    jest.mocked(getCurrentSession).mockResolvedValue({
      userId: "user-1",
      loginEmail: "cyril@example.com",
    });
    jest
      .mocked(createSubscriptionRepository)
      .mockReturnValue({ tag: "subscriptionRepo" } as never);
    jest.mocked(createCheckoutSession).mockResolvedValue({
      url: "https://stripe.test/checkout",
    });
  });

  it("builds the cancel URL from the locale cookie even without middleware locale headers", async () => {
    const request = createRequest({
      headers: {
        "accept-language": "fr-FR,fr;q=0.9",
      },
    });
    request.cookies.set(localeCookieName, "en");

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        cancelUrl: `https://example.com${buildMarketingPricingPath("en")}?checkout=canceled`,
      })
    );
  });

  it("falls back to Accept-Language when no locale cookie is present", async () => {
    const request = createRequest({
      headers: {
        "accept-language": "es-ES,es;q=0.9,en;q=0.7",
      },
      body: { plan: "team", from: PAGE_ROUTES.WORKSPACE },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        cancelUrl: `https://example.com${buildMarketingPricingPath("es")}?checkout=canceled&from=${encodeURIComponent(PAGE_ROUTES.WORKSPACE)}`,
      })
    );
  });

  it("applies the local billing override from the request cookie", async () => {
    const request = createRequest();
    request.cookies.set(
      APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES,
      encodeURIComponent(JSON.stringify({ is_billing_visible: false }))
    );

    await POST(request);

    expect(getBillingVisibility).toHaveBeenCalledWith(expect.anything(), {
      overrideValue: false,
    });
  });
});
