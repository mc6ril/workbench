import { NextRequest, NextResponse } from "next/server";

import { deleteUser } from "@/core/usecases/auth/deleteUser";

import { createAuthRepository } from "@/infrastructure/supabase/auth/AuthRepository.supabase";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/shared/client-admin";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";
import { withRateLimit } from "@/infrastructure/web/rateLimit";
import { verifyCsrfOrigin } from "@/infrastructure/web/security/csrf";

import { API_MESSAGES_AUTH } from "@/shared/constants";
import { createLoggerFactory } from "@/shared/observability";

const logger = createLoggerFactory().forScope("API.DeleteUser");

/**
 * DELETE /api/auth/delete-user
 *
 * Thin controller that delegates to the deleteUser usecase.
 * Provides the admin-enabled auth repository required for user deletion.
 *
 * Requires:
 * - Authenticated user session
 * - Service role key for admin API access
 *
 * Security:
 * - Only the authenticated user can delete their own account
 * - Uses Supabase admin API with service_role key (server-side only)
 */
export const DELETE = async (request: NextRequest): Promise<NextResponse> => {
  const csrfResponse = verifyCsrfOrigin(request);
  if (csrfResponse) {
    return csrfResponse;
  }

  const rateLimitResponse = withRateLimit(request, {
    maxRequests: 3,
    windowMs: 60_000,
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabaseClient = await createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdminClient();
    const authRepository = createAuthRepository(supabaseClient, supabaseAdmin);

    await deleteUser(authRepository);

    return NextResponse.json(
      { success: true, message: API_MESSAGES_AUTH.USER_DELETED },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Delete user error", { error });

    return NextResponse.json(
      { error: API_MESSAGES_AUTH.DELETE_FAILED },
      { status: 500 }
    );
  }
};
