import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { createSessionGateway } from "./SessionGateway.supabase";

// Browser instance for session hooks (Client Components)
export const sessionGateway = createSessionGateway(
  createSupabaseBrowserClient()
);

// Factory function for server contexts (Server Components, Route Handlers)
export { createSessionGateway } from "./SessionGateway.supabase";
