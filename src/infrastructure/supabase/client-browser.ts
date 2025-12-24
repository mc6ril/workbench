import { createBrowserClient } from "@supabase/ssr";

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
 * Singleton browser client instance.
 * Uses @supabase/ssr to handle sessions via cookies.
 */
let browserClientInstance: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Create or get Supabase client for browser (Client Components).
 * Uses @supabase/ssr to handle sessions via cookies.
 * Returns a singleton instance to avoid creating multiple clients.
 *
 * @returns Supabase client configured for browser usage
 */
export const createSupabaseBrowserClient = () => {
  validateEnvironmentVariables();

  // Return singleton instance to avoid creating multiple clients
  if (browserClientInstance) {
    return browserClientInstance;
  }

  browserClientInstance = createBrowserClient(
    SUPABASE_URL!,
    SUPABASE_PUBLISHABLE_KEY!
  );

  return browserClientInstance;
};
