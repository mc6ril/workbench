import { NextRequest, NextResponse } from "next/server";

import { API_MESSAGES_COMMON, API_MESSAGES_STRIPE } from "@/shared/constants";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { buildMarketingPricingPath } from "@/shared/i18n/marketingPaths";
import { getRequestLocale } from "@/shared/i18n/requestLocale";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { withRateLimit } from "@/shared/infrastructure/web/rateLimit";
import { verifyCsrfOrigin } from "@/shared/infrastructure/web/security/csrf";
import { createLoggerFactory } from "@/shared/observability";

import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import { createCheckoutSession } from "@/domains/billing/core/usecases/createCheckoutSession";
import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { stripePaymentGateway } from "@/domains/billing/infrastructure/stripe/stripePaymentGateway";
import { createBillingVisibilityPort } from "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase";
import { createSubscriptionRepository } from "@/domains/billing/infrastructure/supabase/repositories";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";

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
    keyPrefix: "api:stripe:checkout",
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabaseClient = await createSupabaseServerClient();
    const billingVisibilityPort = createBillingVisibilityPort(supabaseClient);
    const isBillingVisible = await getBillingVisibility(billingVisibilityPort);

    if (!isBillingVisible) {
      return NextResponse.json(
        { error: API_MESSAGES_STRIPE.BILLING_DISABLED },
        { status: 404 }
      );
    }

    const sessionGateway = createSessionGateway(supabaseClient);

    let session;
    try {
      session = await getCurrentSession(sessionGateway);
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

    const subscriptionRepo = createSubscriptionRepository(
      supabaseClient,
      supabaseClient
    );

    const origin = request.nextUrl.origin;
    const locale = await getRequestLocale();
    const cancelUrl = new URL(buildMarketingPricingPath(locale), origin);
    cancelUrl.searchParams.set("checkout", "canceled");
    if (body.from) {
      cancelUrl.searchParams.set("from", body.from);
    }

    const result = await createCheckoutSession(
      stripePaymentGateway,
      subscriptionRepo,
      {
        userId: session.userId,
        email: session.loginEmail,
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
