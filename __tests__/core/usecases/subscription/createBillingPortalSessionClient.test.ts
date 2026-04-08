import type { BillingSessionsClientPort } from "@/domains/billing/core/ports/billingSessionsClient.port";
import { createBillingPortalSessionClient } from "@/domains/billing/core/usecases/createBillingPortalSessionClient";

const createBillingSessionsClientMock = (
  overrides: Partial<BillingSessionsClientPort> = {}
): BillingSessionsClientPort => {
  const base: BillingSessionsClientPort = {
    createCheckoutSession: jest.fn(),
    createBillingPortalSession: jest.fn<Promise<{ url: string }>, [{ from?: string }]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};

describe("createBillingPortalSessionClient", () => {
  it("should create a portal session and return the url", async () => {
    const client = createBillingSessionsClientMock({
      createBillingPortalSession: jest.fn(async () => ({ url: "https://portal.test" })),
    });

    const result = await createBillingPortalSessionClient(client, {
      from: "/account",
    });

    expect(client.createBillingPortalSession).toHaveBeenCalledWith({
      from: "/account",
    });
    expect(result).toEqual({ url: "https://portal.test" });
  });
});

