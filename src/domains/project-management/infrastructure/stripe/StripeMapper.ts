import type Stripe from "stripe";

import { SubscriptionPlan } from "@/domains/project-management/core/domain/schema/subscription.schema";

import type { WebhookEvent } from "@/domains/project-management/core/ports/paymentGateway";

/** Maps paid SubscriptionPlan values to their Stripe Price IDs from env. */
export const STRIPE_PRICE_IDS: Partial<Record<SubscriptionPlan, string>> = {
  [SubscriptionPlan.PRO]: process.env.STRIPE_PRO_PRICE_ID,
  [SubscriptionPlan.TEAM]: process.env.STRIPE_TEAM_PRICE_ID,
};

/** Reverse lookup: Stripe Price ID -> domain SubscriptionPlan. */
export const getPlanFromPriceId = (priceId: string): SubscriptionPlan => {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return SubscriptionPlan.PRO;
  }
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
    return SubscriptionPlan.TEAM;
  }
  return SubscriptionPlan.FREE;
};

/** Extract the first subscription item's price ID from a Stripe subscription. */
const extractPriceId = (subscription: Stripe.Subscription): string => {
  return subscription.items.data[0]?.price?.id ?? "";
};

/** Extract Stripe customer ID as string from a customer field (string | object). */
const extractCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer
): string => {
  return typeof customer === "string" ? customer : customer.id;
};

/**
 * Maps a raw Stripe event to a domain WebhookEvent.
 * Translates Stripe-specific types into domain-meaningful events
 * that the usecase layer can process without knowing Stripe internals.
 */
export const mapStripeEventToDomain = (event: Stripe.Event): WebhookEvent => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as SubscriptionPlan | undefined;

      if (!userId || !plan) {
        return { type: "unknown" };
      }

      return {
        type: "checkout.session.completed",
        userId,
        email: session.customer_email ?? "",
        plan,
        stripeCustomerId:
          typeof session.customer === "string"
            ? session.customer
            : (session.customer?.id ?? ""),
        stripeSubscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? ""),
      };
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const firstItem = subscription.items.data[0];

      if (!firstItem) {
        return { type: "unknown" };
      }

      return {
        type: "customer.subscription.updated",
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: extractCustomerId(subscription.customer),
        plan: getPlanFromPriceId(extractPriceId(subscription)),
        status: subscription.status,
        currentPeriodStart: new Date(firstItem.current_period_start * 1000),
        currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      return {
        type: "customer.subscription.deleted",
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: extractCustomerId(subscription.customer),
      };
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const parentSub = invoice.parent?.subscription_details?.subscription;

      return {
        type: "invoice.payment_failed",
        stripeSubscriptionId:
          typeof parentSub === "string" ? parentSub : (parentSub?.id ?? ""),
        stripeCustomerId:
          typeof invoice.customer === "string"
            ? invoice.customer
            : (invoice.customer?.id ?? ""),
      };
    }

    default:
      return { type: "unknown" };
  }
};
