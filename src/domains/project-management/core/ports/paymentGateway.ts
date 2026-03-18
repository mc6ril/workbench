import type { SubscriptionPlan } from "@/domains/project-management/core/domain/schema/subscription.schema";

/**
 * Parsed webhook event from the payment provider.
 * Abstracts Stripe-specific event types into domain-meaningful events.
 */
export type WebhookEvent =
  | {
      type: "checkout.session.completed";
      userId: string;
      email: string;
      plan: SubscriptionPlan;
      stripeCustomerId: string;
      stripeSubscriptionId: string;
    }
  | {
      type: "customer.subscription.updated";
      stripeSubscriptionId: string;
      stripeCustomerId: string;
      plan: SubscriptionPlan;
      status: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
    }
  | {
      type: "customer.subscription.deleted";
      stripeSubscriptionId: string;
      stripeCustomerId: string;
    }
  | {
      type: "invoice.payment_failed";
      stripeSubscriptionId: string;
      stripeCustomerId: string;
    }
  | {
      type: "unknown";
    };

/**
 * Payment gateway contract.
 * Abstracts external payment provider (Stripe) behind a domain port.
 *
 * Implementations must:
 * - Handle Stripe API communication
 * - Map between Stripe objects and domain types
 * - Verify webhook signatures
 */
export type PaymentGateway = {
  /**
   * Create a checkout session for a new subscription.
   * @returns Object with the checkout URL to redirect the user to
   */
  createCheckoutSession(params: {
    userId: string;
    email: string;
    plan: SubscriptionPlan;
    stripeCustomerId?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }>;

  /**
   * Create a billing portal session for managing an existing subscription.
   * @returns Object with the portal URL to redirect the user to
   */
  createPortalSession(params: {
    stripeCustomerId: string;
    returnUrl: string;
  }): Promise<{ url: string }>;

  /**
   * Cancel an active Stripe subscription immediately.
   * Used to prevent duplicate subscriptions when a user re-subscribes via checkout.
   * No-op if the subscription is already canceled.
   * @throws Error if the cancellation fails
   */
  cancelSubscription(stripeSubscriptionId: string): Promise<void>;

  /**
   * Verify webhook signature and parse raw body into a domain event.
   * @throws Error if signature verification fails
   */
  constructWebhookEvent(body: string, signature: string): WebhookEvent;
};
