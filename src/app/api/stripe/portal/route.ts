import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/domains/project-management/core/usecases/auth/getCurrentSession";
import { createBillingPortalSession } from "@/domains/project-management/core/usecases/subscription/createBillingPortalSession";

import { createAuthRepository } from "@/infrastructure/supabase/auth/AuthRepository.supabase";
import { createSubscriptionRepository } from "@/infrastructure/supabase/subscription/SubscriptionRepository.supabase";

import { API_MESSAGES_COMMON, API_MESSAGES_STRIPE } from "@/shared/constants";
import { createSupabaseAdminClient } from "@/shared/infrastructure/supabase/client-admin";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { withRateLimit } from "@/shared/infrastructure/web/rateLimit";
import { verifyCsrfOrigin } from "@/shared/infrastructure/web/security/csrf";
import { createLoggerFactory } from "@/shared/observability";

import { stripePaymentGateway } from "@/domains/project-management/infrastructure/stripe/stripePaymentGateway";

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
