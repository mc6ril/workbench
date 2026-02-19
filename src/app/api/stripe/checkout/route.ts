import { NextRequest, NextResponse } from "next/server";

import { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import { createCheckoutSession } from "@/core/usecases/subscription/createCheckoutSession";

import { stripePaymentGateway } from "@/infrastructure/stripe/stripePaymentGateway";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/shared/client-admin";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";
import { createSubscriptionRepository } from "@/infrastructure/supabase/subscription/SubscriptionRepository.supabase";

import { API_MESSAGES_COMMON, API_MESSAGES_STRIPE } from "@/shared/constants";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe checkout session for the authenticated user.
 * Body: { plan: "pro" | "team" }
 */
export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const supabaseClient = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: API_MESSAGES_COMMON.NOT_AUTHENTICATED },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { plan?: string; from?: string };
    const plan = body.plan;

    if (plan !== SubscriptionPlan.PRO && plan !== SubscriptionPlan.TEAM) {
      return NextResponse.json(
        { error: API_MESSAGES_STRIPE.INVALID_PLAN },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();
    const subscriptionRepo = createSubscriptionRepository(
      supabaseClient,
      adminClient
    );

    const origin = request.nextUrl.origin;
    const cancelUrl = new URL("/pricing", origin);
    cancelUrl.searchParams.set("checkout", "canceled");
    if (body.from) {
      cancelUrl.searchParams.set("from", body.from);
    }

    const result = await createCheckoutSession(
      stripePaymentGateway,
      subscriptionRepo,
      {
        userId: user.id,
        email: user.email ?? "",
        plan,
        successUrl: `${origin}/account?checkout=success`,
        cancelUrl: cancelUrl.toString(),
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : API_MESSAGES_COMMON.UNKNOWN_ERROR;

    return NextResponse.json(
      { error: API_MESSAGES_STRIPE.CHECKOUT_FAILED, details: errorMessage },
      { status: 500 }
    );
  }
};
