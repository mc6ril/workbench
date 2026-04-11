import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createRuntimeConfigPort } from "./RuntimeConfigPort.supabase";

// Browser instance for runtime config reads (Client Components).
export const runtimeConfigPort = createRuntimeConfigPort(
  createSupabaseBrowserClient()
);

// Factory function for server contexts (Route Handlers, Server Components)
export { createRuntimeConfigPort } from "./RuntimeConfigPort.supabase";
