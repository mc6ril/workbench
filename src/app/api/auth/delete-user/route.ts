import { NextRequest, NextResponse } from "next/server";

import { deleteUser } from "@/core/usecases/auth/deleteUser";

import { createAuthRepository } from "@/infrastructure/supabase/auth/AuthRepository.supabase";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/shared/client-admin";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";

import { API_MESSAGES_AUTH, API_MESSAGES_COMMON } from "@/shared/constants";

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
export const DELETE = async (_request: NextRequest): Promise<NextResponse> => {
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
    const errorMessage =
      error instanceof Error
        ? error.message
        : API_MESSAGES_COMMON.UNKNOWN_ERROR;

    return NextResponse.json(
      { error: API_MESSAGES_AUTH.DELETE_FAILED, details: errorMessage },
      { status: 500 }
    );
  }
};
