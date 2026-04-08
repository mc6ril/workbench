import type { BillingSessionsClientPort } from "@/domains/billing/core/ports/billingSessionsClient.port";
import type {
  CreateBillingPortalSessionClientInput,
  CreateCheckoutSessionClientInput,
} from "@/domains/billing/core/ports/billingSessionsClient.port";

type ApiResponse = { url?: string; error?: string };

const parseApiResponse = async (
  response: Response
): Promise<{ url: string }> => {
  const data = (await response.json()) as ApiResponse;

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Billing session creation failed");
  }

  return { url: data.url };
};

export const createBillingSessionsClient = (): BillingSessionsClientPort => ({
  async createCheckoutSession(
    input: CreateCheckoutSessionClientInput
  ): Promise<{ url: string }> {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    return parseApiResponse(response);
  },

  async createBillingPortalSession(
    input: CreateBillingPortalSessionClientInput
  ): Promise<{ url: string }> {
    const response = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    return parseApiResponse(response);
  },
});

