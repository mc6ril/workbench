import { NextRequest, NextResponse } from "next/server";

import { API_MESSAGES_AUTH, API_MESSAGES_COMMON } from "@/shared/constants";
import { AUTH_ERROR_CODE } from "@/shared/constants/errorCodes";
import { createSupabaseAdminClient } from "@/shared/infrastructure/supabase/client-admin";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { withRateLimit } from "@/shared/infrastructure/web/rateLimit";
import { verifyCsrfOrigin } from "@/shared/infrastructure/web/security/csrf";
import { createLoggerFactory } from "@/shared/observability";
import { hasErrorCode } from "@/shared/utils/guards";

import { deleteUser } from "@/domains/auth/core/usecases/user/deleteUser";
import { createAuthRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionRepository } from "@/domains/session/infrastructure/supabase/repositories";

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
    keyPrefix: "api:auth:delete-user",
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const supabaseClient = await createSupabaseServerClient();
    const sessionRepository = createSessionRepository(supabaseClient);

    try {
      await getCurrentSession(sessionRepository);
    } catch {
      return NextResponse.json(
        { error: API_MESSAGES_COMMON.NOT_AUTHENTICATED },
        { status: 401 }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const authRepository = createAuthRepository(supabaseClient, supabaseAdmin);

    await deleteUser(authRepository);

    return NextResponse.json(
      { success: true, message: API_MESSAGES_AUTH.USER_DELETED },
      { status: 200 }
    );
  } catch (error) {
    if (hasErrorCode(error, [AUTH_ERROR_CODE.AUTHENTICATION_ERROR])) {
      return NextResponse.json(
        { error: API_MESSAGES_COMMON.NOT_AUTHENTICATED },
        { status: 401 }
      );
    }

    logger.error("Delete user error", { error });

    return NextResponse.json(
      { error: API_MESSAGES_AUTH.DELETE_FAILED },
      { status: 500 }
    );
  }
};
