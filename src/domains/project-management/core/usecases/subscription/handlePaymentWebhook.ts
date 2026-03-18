import type { WebhookParams } from "@/domains/project-management/core/domain/schema/subscription.schema";
import {
  mapPaymentStatus,
  SubscriptionStatus,
} from "@/domains/project-management/core/domain/schema/subscription.schema";

import type { PaymentGateway } from "@/domains/project-management/core/ports/paymentGateway";
import type { SubscriptionRepository } from "@/domains/project-management/core/ports/subscriptionRepository";

/**
 * Handle a Stripe webhook event.
 * Parses the raw body, verifies the signature, and updates subscription state accordingly.
 *
 * Handled events:
 * - checkout.session.completed → upsert subscription with Stripe IDs
 * - customer.subscription.updated → update plan/status/period
 * - customer.subscription.deleted → delete subscription (user falls back to free)
 * - invoice.payment_failed → mark subscription as past_due
 */
export const handlePaymentWebhook = async (
  paymentGateway: PaymentGateway,
  subscriptionRepo: SubscriptionRepository,
  params: WebhookParams
): Promise<void> => {
  const event = paymentGateway.constructWebhookEvent(
    params.rawBody,
    params.signature
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const existing = await subscriptionRepo.getByUserId(event.userId);

      if (
        existing?.stripeSubscriptionId &&
        existing.stripeSubscriptionId !== event.stripeSubscriptionId
      ) {
        await paymentGateway.cancelSubscription(existing.stripeSubscriptionId);
      }

      await subscriptionRepo.upsert({
        userId: event.userId,
        plan: event.plan,
        status: SubscriptionStatus.ACTIVE,
        stripeCustomerId: event.stripeCustomerId,
        stripeSubscriptionId: event.stripeSubscriptionId,
      });
      break;
    }

    case "customer.subscription.updated": {
      const existing = await subscriptionRepo.getByStripeCustomerId(
        event.stripeCustomerId
      );
      if (existing) {
        await subscriptionRepo.upsert({
          userId: existing.userId,
          plan: event.plan,
          status: mapPaymentStatus(event.status),
          stripeCustomerId: event.stripeCustomerId,
          stripeSubscriptionId: event.stripeSubscriptionId,
          currentPeriodStart: event.currentPeriodStart,
          currentPeriodEnd: event.currentPeriodEnd,
          cancelAtPeriodEnd: event.cancelAtPeriodEnd,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = await subscriptionRepo.getByStripeCustomerId(
        event.stripeCustomerId
      );
      if (sub) {
        await subscriptionRepo.deleteByUserId(sub.userId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const sub = await subscriptionRepo.getByStripeCustomerId(
        event.stripeCustomerId
      );
      if (sub) {
        await subscriptionRepo.upsert({
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
