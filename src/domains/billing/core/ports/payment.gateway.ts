import type {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/domains/billing/core/domain/subscription.types";

/**
 * Parsed webhook event from the payment provider.
 * Abstracts Stripe-specific event types into domain-meaningful events.
 */
export type PaymentWebhookEvent =
  | {
      type: "checkout.session.completed";
      userId: string;
      email: string;
      plan: SubscriptionPlan;
      customerId: string;
      subscriptionId: string;
    }
  | {
      type: "customer.subscription.updated";
      subscriptionId: string;
      customerId: string;
      plan: SubscriptionPlan;
      status: SubscriptionStatus;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
    }
  | {
      type: "customer.subscription.deleted";
      subscriptionId: string;
      customerId: string;
    }
  | {
      type: "invoice.payment_failed";
      subscriptionId: string;
      customerId: string;
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
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }>;

  /**
   * Create a billing portal session for managing an existing subscription.
   * @returns Object with the portal URL to redirect the user to
   */
  createBillingPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): Promise<{ url: string }>;

  /**
   * Cancel an active Stripe subscription immediately.
   * Used to prevent duplicate subscriptions when a user re-subscribes via checkout.
   * No-op if the subscription is already canceled.
   * @throws Error if the cancellation fails
   */
  cancelSubscription(subscriptionId: string): Promise<void>;

  /**
   * Verify webhook signature and parse raw body into a domain event.
   * @throws Error if signature verification fails
   */
  parseWebhookEvent(body: string, signature: string): PaymentWebhookEvent;
};
