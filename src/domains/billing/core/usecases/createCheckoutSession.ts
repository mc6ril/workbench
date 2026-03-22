import type { CreateCheckoutParams } from "@/domains/billing/core/domain/subscription.schema";
import type { PaymentGateway } from "@/domains/billing/core/ports/paymentGateway";
import type { SubscriptionRepository } from "@/domains/billing/core/ports/subscriptionRepository";

/**
 * Create a Stripe checkout session for subscribing to a plan.
 * Reuses existing Stripe customer ID if the user already has one.
 * Cancels any active Stripe subscription before creating a new one
 * to prevent duplicate billing.
 */
export const createCheckoutSession = async (
  paymentGateway: PaymentGateway,
  subscriptionRepo: SubscriptionRepository,
  params: CreateCheckoutParams
): Promise<{ url: string }> => {
  const existing = await subscriptionRepo.getByUserId(params.userId);

  if (existing?.stripeSubscriptionId) {
    await paymentGateway.cancelSubscription(existing.stripeSubscriptionId);
  }

  return paymentGateway.createCheckoutSession({
    userId: params.userId,
    email: params.email,
    plan: params.plan,
    stripeCustomerId: existing?.stripeCustomerId ?? undefined,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  });
};
