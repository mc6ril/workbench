import Stripe from "stripe";

import { createAppError } from "@/shared/errors/appError";
import { INFRA_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { getStripeClient } from "@/shared/infrastructure/stripe/stripeClient";

import { mapStripeEventToDomain, STRIPE_PRICE_IDS } from "./StripeMapper";

import type {
  PaymentGateway,
  PaymentWebhookEvent,
} from "@/domains/billing/core/ports/payment.gateway";

/**
 * Stripe implementation of the PaymentGateway port.
 * Delegates all mapping logic to StripeMapper.
 */
export const stripePaymentGateway: PaymentGateway = {
  async createCheckoutSession(params) {
    const stripe = getStripeClient();
    const priceId = STRIPE_PRICE_IDS[params.plan];

    if (!priceId) {
      throw createAppError(INFRA_ERROR_CODE.STRIPE_PRICE_NOT_CONFIGURED, {
        debugMessage:
          `No Stripe Price ID configured for plan "${params.plan}". ` +
          "Check STRIPE_PRO_PRICE_ID and STRIPE_TEAM_PRICE_ID environment variables.",
      });
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

    if (params.customerId) {
      sessionParams.customer = params.customerId;
    } else {
      sessionParams.customer_email = params.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw createAppError(INFRA_ERROR_CODE.STRIPE_CHECKOUT_NO_URL, {
        debugMessage: "Stripe checkout session did not return a URL",
      });
    }

    return { url: session.url };
  },

  async createBillingPortalSession(params) {
    const stripe = getStripeClient();

    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });

    return { url: session.url };
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const stripe = getStripeClient();

    try {
      await stripe.subscriptions.cancel(subscriptionId);
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

  parseWebhookEvent(body: string, signature: string): PaymentWebhookEvent {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw createAppError(INFRA_ERROR_CODE.STRIPE_WEBHOOK_NOT_CONFIGURED, {
        debugMessage:
          "STRIPE_WEBHOOK_SECRET is not configured. " +
          "Please add it to your .env.local file.",
      });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    return mapStripeEventToDomain(event);
  },
};
