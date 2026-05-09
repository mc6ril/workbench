import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { Database } from "@/shared/infrastructure/supabase/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

/**
 * Unauthenticated server client — uses the public anon key without a session.
 * Safe to use inside unstable_cache (no cookies() call, no request context needed).
 * Only suitable for data accessible via public RLS policies.
 */
export const createSupabaseAnonServerClient = () => {
  return createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );
};

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
