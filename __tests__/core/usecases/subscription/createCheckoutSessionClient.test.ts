import { PAGE_ROUTES } from "@/shared/constants/routes";

import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import type { BillingSessionsClientPort } from "@/domains/billing/core/ports/billingSessionsClient.port";
import { createCheckoutSessionClient } from "@/domains/billing/core/usecases/createCheckoutSessionClient";

const createBillingSessionsClientMock = (
  overrides: Partial<BillingSessionsClientPort> = {}
): BillingSessionsClientPort => {
  const base: BillingSessionsClientPort = {
    createCheckoutSession: jest.fn<
      Promise<{ url: string }>,
      [{ plan: SubscriptionPlan; from?: string }]
    >(),
    createBillingPortalSession: jest.fn<
      Promise<{ url: string }>,
      [{ from?: string }]
    >(),
  };

  return {
    ...base,
    ...overrides,
  };
};

describe("createCheckoutSessionClient", () => {
  it("should create a checkout session and return the url", async () => {
    const client = createBillingSessionsClientMock({
      createCheckoutSession: jest.fn(async () => ({ url: "https://stripe.test" })),
    });

    const result = await createCheckoutSessionClient(client, {
      plan: SubscriptionPlan.PRO,
      from: PAGE_ROUTES.WORKSPACE,
    });

    expect(client.createCheckoutSession).toHaveBeenCalledWith({
      plan: SubscriptionPlan.PRO,
      from: PAGE_ROUTES.WORKSPACE,
    });
    expect(result).toEqual({ url: "https://stripe.test" });
  });

  it("should reject invalid input", async () => {
    const client = createBillingSessionsClientMock();

    await expect(
      createCheckoutSessionClient(client, {
        plan: "invalid" as unknown as SubscriptionPlan,
      })
    ).rejects.toBeInstanceOf(Error);
  });
});
