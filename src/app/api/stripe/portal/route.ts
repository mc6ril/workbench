import { NextRequest, NextResponse } from "next/server";

import { API_MESSAGES_COMMON, API_MESSAGES_STRIPE } from "@/shared/constants";
import { createSupabaseAdminClient } from "@/shared/infrastructure/supabase/client-admin";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { withRateLimit } from "@/shared/infrastructure/web/rateLimit";
import { verifyCsrfOrigin } from "@/shared/infrastructure/web/security/csrf";
import { createLoggerFactory } from "@/shared/observability";

import { getCurrentSession } from "@/domains/auth/core/usecases/getCurrentSession";
import { createAuthRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { createBillingPortalSession } from "@/domains/billing/core/usecases/createBillingPortalSession";
import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { stripePaymentGateway } from "@/domains/billing/infrastructure/stripe/stripePaymentGateway";
import { createBillingConfigRepository } from "@/domains/billing/infrastructure/supabase/BillingConfigRepository.supabase";
import { createSubscriptionRepository } from "@/domains/billing/infrastructure/supabase/repositories";

const logger = createLoggerFactory().forScope("API.Portal");

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe billing portal session for the authenticated user.
 * Allows managing existing subscription (cancel, change plan, update payment method).
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
    const billingConfigRepository = createBillingConfigRepository(supabaseClient);
    const isBillingVisible = await getBillingVisibility(billingConfigRepository);

    if (!isBillingVisible) {
      return NextResponse.json(
        { error: API_MESSAGES_STRIPE.BILLING_DISABLED },
        { status: 404 }
      );
    }

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

    const adminClient = createSupabaseAdminClient();
    const subscriptionRepo = createSubscriptionRepository(
      supabaseClient,
      adminClient
    );

    const origin = request.nextUrl.origin;
    const result = await createBillingPortalSession(
      stripePaymentGateway,
      subscriptionRepo,
      {
        userId: session.userId,
        returnUrl: `${origin}/account`,
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.error("Portal error", { error });

    return NextResponse.json(
      { error: API_MESSAGES_STRIPE.PORTAL_FAILED },
      { status: 500 }
    );
  }
};
