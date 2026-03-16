import { NextRequest, NextResponse } from "next/server";

import { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import { getCurrentSession } from "@/core/usecases/auth/getCurrentSession";
import { createCheckoutSession } from "@/core/usecases/subscription/createCheckoutSession";

import { stripePaymentGateway } from "@/infrastructure/stripe/stripePaymentGateway";
import { createAuthRepository } from "@/infrastructure/supabase/auth/AuthRepository.supabase";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/shared/client-admin";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";
import { createSubscriptionRepository } from "@/infrastructure/supabase/subscription/SubscriptionRepository.supabase";
import { withRateLimit } from "@/infrastructure/web/rateLimit";
import { verifyCsrfOrigin } from "@/infrastructure/web/security/csrf";

import { API_MESSAGES_COMMON, API_MESSAGES_STRIPE } from "@/shared/constants";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { createLoggerFactory } from "@/shared/observability";

const logger = createLoggerFactory().forScope("API.Checkout");

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe checkout session for the authenticated user.
 * Body: { plan: "pro" | "team" }
 */
export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const csrfResponse = verifyCsrfOrigin(request);
  if (csrfResponse) {
    return csrfResponse;
  }

  const rateLimitResponse = withRateLimit(request, {
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabaseClient = await createSupabaseServerClient();
    const authRepo = createAuthRepository(supabaseClient);

    let session;
    try {
      session = await getCurrentSession(authRepo);
    } catch {
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
    const cancelUrl = new URL(PAGE_ROUTES.PRICING, origin);
    cancelUrl.searchParams.set("checkout", "canceled");
    if (body.from) {
      cancelUrl.searchParams.set("from", body.from);
    }

    const result = await createCheckoutSession(
      stripePaymentGateway,
      subscriptionRepo,
      {
        userId: session.userId,
        email: session.email,
        plan,
        successUrl: `${origin}${PAGE_ROUTES.ACCOUNT}?checkout=success`,
        cancelUrl: cancelUrl.toString(),
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error("Checkout error", { error });

    return NextResponse.json(
      { error: API_MESSAGES_STRIPE.CHECKOUT_FAILED },
      { status: 500 }
    );
  }
};
