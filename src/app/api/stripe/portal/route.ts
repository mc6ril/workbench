import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/core/usecases/auth/getCurrentSession";
import { createBillingPortalSession } from "@/core/usecases/subscription/createBillingPortalSession";

import { stripePaymentGateway } from "@/infrastructure/stripe/stripePaymentGateway";
import { createAuthRepository } from "@/infrastructure/supabase/auth/AuthRepository.supabase";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/shared/client-admin";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";
import { createSubscriptionRepository } from "@/infrastructure/supabase/subscription/SubscriptionRepository.supabase";

import { API_MESSAGES_COMMON, API_MESSAGES_STRIPE } from "@/shared/constants";
import { withRateLimit } from "@/shared/rateLimit";

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe billing portal session for the authenticated user.
 * Allows managing existing subscription (cancel, change plan, update payment method).
 */
export const POST = async (request: NextRequest): Promise<NextResponse> => {
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
    console.error("[API] Portal error:", error);

    return NextResponse.json(
      { error: API_MESSAGES_STRIPE.PORTAL_FAILED },
      { status: 500 }
    );
  }
};
