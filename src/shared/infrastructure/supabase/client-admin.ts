import { createClient } from "@supabase/supabase-js";

/**
 * Create Supabase admin client with service_role key.
 * This client bypasses RLS and allows admin operations.
 *
 * ⚠️ SECURITY WARNING: This should ONLY be used server-side.
 * Never expose the service_role key to the client.
 *
 * @returns Supabase admin client
 * @throws Error if service_role key or URL is not configured
 */
export const createSupabaseAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. " +
        "Please add it to your .env.local file. " +
        "You can find it in your Supabase dashboard: Settings → API → service_role key"
    );
  }

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured. This is required for Supabase client."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
