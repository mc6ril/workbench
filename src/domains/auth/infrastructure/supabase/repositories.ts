import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createAuthRepository } from "./AuthRepository.supabase";

// Browser instance for auth hooks (Client Components)
export const authRepository = createAuthRepository(
  createSupabaseBrowserClient()
);

// Factory function for server contexts (Server Components, Route Handlers)
export { createAuthRepository } from "./AuthRepository.supabase";
