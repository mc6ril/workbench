import { z } from "zod";

import type { PaymentGateway } from "@/domains/billing/core/ports/payment.gateway";
import type { SubscriptionRepository } from "@/domains/billing/core/ports/subscription.repository";

const CreateBillingPortalSessionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  returnUrl: z.string().url("Invalid return URL"),
});

type CreateBillingPortalSessionInput = z.infer<
  typeof CreateBillingPortalSessionSchema
>;

/**
 * Create a billing portal session for managing an existing subscription.
 * Requires the user to already have a billing customer ID.
 */
export const createBillingPortalSession = async (
  paymentGateway: PaymentGateway,
  subscriptionRepository: SubscriptionRepository,
  input: CreateBillingPortalSessionInput
): Promise<{ url: string }> => {
  const params = CreateBillingPortalSessionSchema.parse(input);
  const subscription = await subscriptionRepository.getByUserId(params.userId);

  if (!subscription?.customerId) {
    throw new Error("No billing customer found for this user.");
  }

  return paymentGateway.createBillingPortalSession({
    customerId: subscription.customerId,
    returnUrl: params.returnUrl,
  });
};
