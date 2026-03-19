import type { CreateBillingPortalParams } from "@/domains/billing/core/domain/schema/subscription.schema";
import type { PaymentGateway } from "@/domains/billing/core/ports/paymentGateway";
import type { SubscriptionRepository } from "@/domains/billing/core/ports/subscriptionRepository";

/**
 * Create a Stripe billing portal session for managing an existing subscription.
 * Requires the user to already have a Stripe customer ID.
 */
export const createBillingPortalSession = async (
  paymentGateway: PaymentGateway,
  subscriptionRepo: SubscriptionRepository,
  params: CreateBillingPortalParams
): Promise<{ url: string }> => {
  const subscription = await subscriptionRepo.getByUserId(params.userId);

  if (!subscription?.stripeCustomerId) {
    throw new Error(
      "No Stripe customer found for this user. Cannot open billing portal."
    );
  }

  return paymentGateway.createPortalSession({
    stripeCustomerId: subscription.stripeCustomerId,
    returnUrl: params.returnUrl,
  });
};
