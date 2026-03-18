import { NextRequest, NextResponse } from "next/server";

import { handlePaymentWebhook } from "@/domains/project-management/core/usecases/subscription/handlePaymentWebhook";

import { stripePaymentGateway } from "@/domains/project-management/infrastructure/stripe/stripePaymentGateway";
import { createSupabaseAdminClient } from "@/shared/infrastructure/supabase/client-admin";
import { createSubscriptionRepository } from "@/infrastructure/supabase/subscription/SubscriptionRepository.supabase";

import { API_MESSAGES_STRIPE } from "@/shared/constants";
import { createLoggerFactory } from "@/shared/observability";

const logger = createLoggerFactory().forScope("API.Webhook");

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe webhook events. Not authenticated (Stripe calls this endpoint).
 * Signature is verified via the Stripe webhook secret.
 *
 * Must read the raw body (not parsed JSON) for signature verification.
 */
export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: API_MESSAGES_STRIPE.MISSING_SIGNATURE },
        { status: 400 }
      );
    }

    const rawBody = await request.text();

    const adminClient = createSupabaseAdminClient();
    const subscriptionRepo = createSubscriptionRepository(
      adminClient,
      adminClient
    );

    await handlePaymentWebhook(stripePaymentGateway, subscriptionRepo, {
      rawBody,
      signature,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error("Webhook error", { error });

    return NextResponse.json(
      { error: API_MESSAGES_STRIPE.WEBHOOK_FAILED },
      { status: 500 }
    );
  }
};
