import { z } from "zod";

import { SubscriptionStatus } from "@/domains/billing/core/domain/subscription.types";
import type { PaymentGateway } from "@/domains/billing/core/ports/payment.gateway";
import type { SubscriptionRepository } from "@/domains/billing/core/ports/subscription.repository";

const HandlePaymentWebhookSchema = z.object({
  rawBody: z.string().min(1, "Raw body is required"),
  signature: z.string().min(1, "Signature is required"),
});

type HandlePaymentWebhookInput = z.infer<typeof HandlePaymentWebhookSchema>;

/**
 * Handle a payment webhook event.
 * Parses the raw body, verifies the signature, and updates subscription state accordingly.
 *
 * Handled events:
 * - checkout.session.completed → upsert subscription with billing IDs
 * - customer.subscription.updated → update plan/status/period
 * - customer.subscription.deleted → delete subscription (user falls back to free)
 * - invoice.payment_failed → mark subscription as past_due
 */
export const handlePaymentWebhook = async (
  paymentGateway: PaymentGateway,
  subscriptionRepository: SubscriptionRepository,
  input: HandlePaymentWebhookInput
): Promise<void> => {
  const params = HandlePaymentWebhookSchema.parse(input);
  const event = paymentGateway.parseWebhookEvent(
    params.rawBody,
    params.signature
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const existing = await subscriptionRepository.getByUserId(event.userId);

      if (existing?.subscriptionId && existing.subscriptionId !== event.subscriptionId) {
        await paymentGateway.cancelSubscription(existing.subscriptionId);
      }

      await subscriptionRepository.save({
        userId: event.userId,
        plan: event.plan,
        status: SubscriptionStatus.ACTIVE,
        customerId: event.customerId,
        subscriptionId: event.subscriptionId,
      });
      break;
    }

    case "customer.subscription.updated": {
      const existing = await subscriptionRepository.getByCustomerId(
        event.customerId
      );
      if (existing) {
        await subscriptionRepository.save({
          userId: existing.userId,
          plan: event.plan,
          status: event.status,
          customerId: event.customerId,
          subscriptionId: event.subscriptionId,
          currentPeriodStart: event.currentPeriodStart,
          currentPeriodEnd: event.currentPeriodEnd,
          cancelAtPeriodEnd: event.cancelAtPeriodEnd,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = await subscriptionRepository.getByCustomerId(event.customerId);
      if (sub) {
        await subscriptionRepository.deleteByUserId(sub.userId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const sub = await subscriptionRepository.getByCustomerId(event.customerId);
      if (sub) {
        await subscriptionRepository.save({
          userId: sub.userId,
          plan: sub.plan,
          status: SubscriptionStatus.PAST_DUE,
        });
      }
      break;
    }

    case "unknown":
      break;
  }
};
