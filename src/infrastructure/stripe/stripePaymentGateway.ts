import Stripe from "stripe";

import { getStripeClient } from "./stripeClient";
import { mapStripeEventToDomain, STRIPE_PRICE_IDS } from "./StripeMapper";

import type { PaymentGateway, WebhookEvent } from "@/core/ports/paymentGateway";

/**
 * Stripe implementation of the PaymentGateway port.
 * Delegates all mapping logic to StripeMapper.
 */
export const stripePaymentGateway: PaymentGateway = {
  async createCheckoutSession(params) {
    const stripe = getStripeClient();
    const priceId = STRIPE_PRICE_IDS[params.plan];

    if (!priceId) {
      throw new Error(
        `No Stripe Price ID configured for plan "${params.plan}". ` +
          "Check STRIPE_PRO_PRICE_ID and STRIPE_TEAM_PRICE_ID environment variables."
      );
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        plan: params.plan,
      },
    };

    if (params.stripeCustomerId) {
      sessionParams.customer = params.stripeCustomerId;
    } else {
      sessionParams.customer_email = params.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error("Stripe checkout session did not return a URL");
    }

    return { url: session.url };
  },

  async createPortalSession(params) {
    const stripe = getStripeClient();

    const session = await stripe.billingPortal.sessions.create({
      customer: params.stripeCustomerId,
      return_url: params.returnUrl,
    });

    return { url: session.url };
  },

  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    const stripe = getStripeClient();

    try {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (error) {
      if (
        error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.code === "resource_missing"
      ) {
        return;
      }
      throw error;
    }
  },

  constructWebhookEvent(body: string, signature: string): WebhookEvent {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error(
        "STRIPE_WEBHOOK_SECRET is not configured. " +
          "Please add it to your .env.local file."
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    return mapStripeEventToDomain(event);
  },
};
