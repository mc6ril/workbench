import { z } from "zod";

import type { BillingSessionsClientPort } from "@/domains/billing/core/ports/billingSessionsClient.port";
import { CreateCheckoutSessionClientInputSchema } from "@/domains/billing/core/ports/billingSessionsClient.port";

const CreateCheckoutSessionClientSchema =
  CreateCheckoutSessionClientInputSchema;

type CreateCheckoutSessionClientInput = z.infer<
  typeof CreateCheckoutSessionClientSchema
>;

/**
 * Create a checkout session through the app API (client-safe).
 * Returns a redirect URL.
 */
export const createCheckoutSessionClient = async (
  billingSessionsClient: BillingSessionsClientPort,
  input: CreateCheckoutSessionClientInput
): Promise<{ url: string }> => {
  const parsed = CreateCheckoutSessionClientSchema.parse(input);
  return billingSessionsClient.createCheckoutSession(parsed);
};
