import { createBrowserClient } from "@supabase/ssr";

import { Database } from "@/shared/infrastructure/supabase/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createSupabaseBrowserClient = () => {
  return createBrowserClient<Database>(
    SUPABASE_URL!,
    SUPABASE_PUBLISHABLE_KEY!
  );
};
