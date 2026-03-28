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

jest.mock("@/shared/infrastructure/supabase/client-admin", () => ({
  createSupabaseAdminClient: jest.fn(),
}));

jest.mock("@/domains/billing/infrastructure/supabase/repositories", () => ({
  createSubscriptionRepository: jest.fn(),
}));

jest.mock("@/domains/billing/core/usecases/handlePaymentWebhook", () => ({
  handlePaymentWebhook: jest.fn(),
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

import { POST } from "@/app/api/stripe/webhook/route";
import { handlePaymentWebhook } from "@/domains/billing/core/usecases/handlePaymentWebhook";
import { createSubscriptionRepository } from "@/domains/billing/infrastructure/supabase/repositories";

type MockNextResponse = {
  status: number;
  headers: Record<string, string>;
  json: () => Promise<unknown>;
};

const createRequest = ({
  body = "{}",
  signature,
  ip = "203.0.113.10",
}: {
  body?: string;
  signature?: string;
  ip?: string;
} = {}): NextRequest =>
  ({
    url: "https://example.com/api/stripe/webhook",
    headers: {
      get: (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName === "stripe-signature") {
          return signature ?? null;
        }
        if (lowerName === "x-forwarded-for") {
          return ip;
        }
        return null;
      },
    },
    text: async () => body,
  }) as NextRequest;

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects requests without a stripe signature header", async () => {
    const response = (await POST(
      createRequest()
    )) as unknown as MockNextResponse;

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing stripe-signature header",
    });
  });

  it("returns 400 when the Stripe signature is invalid", async () => {
    jest
      .mocked(createSupabaseAdminClient)
      .mockReturnValue({} as ReturnType<typeof createSupabaseAdminClient>);
    jest
      .mocked(createSubscriptionRepository)
      .mockReturnValue({} as ReturnType<typeof createSubscriptionRepository>);
    jest.mocked(handlePaymentWebhook).mockRejectedValue(
      Object.assign(new Error("Invalid signature"), {
        name: "StripeSignatureVerificationError",
      })
    );

    const response = (await POST(
      createRequest({ signature: "t=1,v1=invalid" })
    )) as unknown as MockNextResponse;

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid stripe signature",
    });
  });

  it("processes valid webhook requests with the admin repository", async () => {
    const adminClient = {} as ReturnType<typeof createSupabaseAdminClient>;
    const subscriptionRepository =
      {} as ReturnType<typeof createSubscriptionRepository>;

    jest.mocked(createSupabaseAdminClient).mockReturnValue(adminClient);
    jest
      .mocked(createSubscriptionRepository)
      .mockReturnValue(subscriptionRepository);
    jest.mocked(handlePaymentWebhook).mockResolvedValue(undefined);

    const response = (await POST(
      createRequest({
        body: '{"id":"evt_test"}',
        signature: "t=1,v1=valid",
      })
    )) as unknown as MockNextResponse;

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(createSubscriptionRepository).toHaveBeenCalledWith(
      adminClient,
      adminClient
    );
    expect(handlePaymentWebhook).toHaveBeenCalledTimes(1);
  });
});
