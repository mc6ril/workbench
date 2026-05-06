import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { createAuthGateway } from "./AuthRepository.supabase";

// Browser instance for auth hooks (Client Components)
export const authGateway = createAuthGateway(createSupabaseBrowserClient());

// Factory function for server contexts (Server Components, Route Handlers)
export { createAuthGateway } from "./AuthRepository.supabase";
