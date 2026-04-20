import { z } from "zod";

import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";

export const CreateCheckoutSessionClientInputSchema = z.object({
  plan: z.nativeEnum(SubscriptionPlan),
  from: z.string().optional(),
});

export type CreateCheckoutSessionClientInput = z.infer<
  typeof CreateCheckoutSessionClientInputSchema
>;

export const CreateBillingPortalSessionClientInputSchema = z.object({
  from: z.string().optional(),
});

export type CreateBillingPortalSessionClientInput = z.infer<
  typeof CreateBillingPortalSessionClientInputSchema
>;

/**
 * Client-side contract for creating billing redirect sessions via app API routes.
 *
 * This is intentionally separate from the server-side `PaymentGateway` port,
 * which talks directly to Stripe and requires privileged context.
 */
export type BillingSessionsClientPort = {
  createCheckoutSession(
    input: CreateCheckoutSessionClientInput
  ): Promise<{ url: string }>;
  createBillingPortalSession(
    input: CreateBillingPortalSessionClientInput
  ): Promise<{ url: string }>;
};
