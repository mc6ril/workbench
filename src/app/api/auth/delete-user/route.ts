import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/infrastructure/supabase/shared/client-admin";
import { createSupabaseServerClient } from "@/infrastructure/supabase/shared/client-server";

/**
 * DELETE /api/auth/delete-user
 *
 * Deletes the current authenticated user from Supabase auth and removes
 * all associated data from project_members table.
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
    // Get authenticated user (use getUser() for security instead of getSession())
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const userEmail = user.email;

    // Create admin client with service role key
    // This client bypasses RLS and allows admin operations
    const supabaseAdmin = createSupabaseAdminClient();

    // Delete user from auth using admin API
    // Note: project_members will be automatically deleted via CASCADE
    // (see migration 000003: user_id REFERENCES auth.users(id) ON DELETE CASCADE)
    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      return NextResponse.json(
        {
          error: "Failed to delete user",
          details: deleteUserError.message,
        },
        { status: 500 }
      );
    }

    // Sign out the user session
    await supabase.auth.signOut();

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
        userId,
        userEmail,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
};
