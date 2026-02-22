import { NextRequest, NextResponse } from "next/server";

import { handlePaymentWebhook } from "@/core/usecases/subscription/handlePaymentWebhook";

import { stripePaymentGateway } from "@/infrastructure/stripe/stripePaymentGateway";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/shared/client-admin";
import { createSubscriptionRepository } from "@/infrastructure/supabase/subscription/SubscriptionRepository.supabase";

import { API_MESSAGES_STRIPE } from "@/shared/constants";

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
    console.error("[API] Webhook error:", error);

    return NextResponse.json(
      { error: API_MESSAGES_STRIPE.WEBHOOK_FAILED },
      { status: 500 }
    );
  }
};
