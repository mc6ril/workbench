import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

/** Validate required env vars; throw with helpful message on missing. */
const validateEnvironmentVariables = (): void => {
  const missingVariables: string[] = [];

  if (!SUPABASE_URL) {
    missingVariables.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!SUPABASE_PUBLISHABLE_KEY) {
    missingVariables.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
  }

  if (missingVariables.length > 0) {
    const variablesList = missingVariables.join(", ");
    throw new Error(
      `Missing required environment variable(s): ${variablesList}\n` +
        `Please add them to your .env.local file.\n` +
        `See .env.local.example for reference.`
    );
  }
};

/**
 * Create Supabase client for server (Server Components, Server Actions, Middleware).
 * Uses @supabase/ssr to handle sessions via cookies.
 * Creates a new instance on each call (no singleton) to ensure proper cookie handling
 * in server contexts where cookies may change between requests.
 *
 * @returns Supabase client configured for server usage
 */
export const createSupabaseServerClient = async () => {
  try {
    validateEnvironmentVariables();

    const cookieStore = await cookies();

    return createServerClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn(
              "[Supabase Server Client] Failed to set cookies in Server Component:",
              error
            );
          }
        },
      },
    });
  } catch (error) {
    console.error(
      "[Supabase Server Client] Failed to create server client:",
      error
    );
    throw error;
  }
};
