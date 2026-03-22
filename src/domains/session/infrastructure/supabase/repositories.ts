import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createSessionRepository } from "./SessionRepository.supabase";

// Browser instance for session hooks (Client Components)
export const sessionRepository = createSessionRepository(
  createSupabaseBrowserClient()
);

// Factory function for server contexts (Server Components, Route Handlers)
export { createSessionRepository } from "./SessionRepository.supabase";
