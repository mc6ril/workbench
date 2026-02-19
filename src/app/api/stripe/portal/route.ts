import { NextRequest, NextResponse } from "next/server";

import { createBillingPortalSession } from "@/core/usecases/subscription/createBillingPortalSession";

import { stripePaymentGateway } from "@/infrastructure/stripe/stripePaymentGateway";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/shared/client-admin";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";
import { createSubscriptionRepository } from "@/infrastructure/supabase/subscription/SubscriptionRepository.supabase";

import { API_MESSAGES_COMMON, API_MESSAGES_STRIPE } from "@/shared/constants";

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe billing portal session for the authenticated user.
 * Allows managing existing subscription (cancel, change plan, update payment method).
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
        userId: user.id,
        returnUrl: `${origin}/account`,
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : API_MESSAGES_COMMON.UNKNOWN_ERROR;

    return NextResponse.json(
      { error: API_MESSAGES_STRIPE.PORTAL_FAILED, details: errorMessage },
      { status: 500 }
    );
  }
};
