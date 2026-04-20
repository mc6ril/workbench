import { z } from "zod";

import type { BillingSessionsClientPort } from "@/domains/billing/core/ports/billingSessionsClient.port";
import { CreateBillingPortalSessionClientInputSchema } from "@/domains/billing/core/ports/billingSessionsClient.port";

const CreateBillingPortalSessionClientSchema =
  CreateBillingPortalSessionClientInputSchema;

type CreateBillingPortalSessionClientInput = z.infer<
  typeof CreateBillingPortalSessionClientSchema
>;

/**
 * Create a billing portal session through the app API (client-safe).
 * Returns a redirect URL.
 */
export const createBillingPortalSessionClient = async (
  billingSessionsClient: BillingSessionsClientPort,
  input: CreateBillingPortalSessionClientInput
): Promise<{ url: string }> => {
  const parsed = CreateBillingPortalSessionClientSchema.parse(input);
  return billingSessionsClient.createBillingPortalSession(parsed);
};
