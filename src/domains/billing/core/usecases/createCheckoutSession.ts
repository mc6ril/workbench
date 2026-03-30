import { z } from "zod";

import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import type { PaymentGateway } from "@/domains/billing/core/ports/payment.gateway";
import type { SubscriptionRepository } from "@/domains/billing/core/ports/subscription.repository";

const CreateCheckoutSessionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email format"),
  plan: z.nativeEnum(SubscriptionPlan),
  successUrl: z.string().url("Invalid success URL"),
  cancelUrl: z.string().url("Invalid cancel URL"),
});

type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;

/**
 * Create a checkout session for subscribing to a plan.
 * Reuses the existing billing customer ID if the user already has one.
 * Cancels any active billing subscription before creating a new one
 * to prevent duplicate billing.
 */
export const createCheckoutSession = async (
  paymentGateway: PaymentGateway,
  subscriptionRepository: SubscriptionRepository,
  input: CreateCheckoutSessionInput
): Promise<{ url: string }> => {
  const params = CreateCheckoutSessionSchema.parse(input);
  const existing = await subscriptionRepository.getByUserId(params.userId);

  if (existing?.subscriptionId) {
    await paymentGateway.cancelSubscription(existing.subscriptionId);
  }

  return paymentGateway.createCheckoutSession({
    userId: params.userId,
    email: params.email,
    plan: params.plan,
    customerId: existing?.customerId ?? undefined,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  });
};
