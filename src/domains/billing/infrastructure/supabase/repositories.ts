import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { createBillingVisibilityPort } from "./BillingVisibilityPort.supabase";
import { createSubscriptionRepository } from "./SubscriptionRepository.supabase";

// Browser instance for billing hooks (Client Components)
export const subscriptionRepository = createSubscriptionRepository(
  createSupabaseBrowserClient(),
  createSupabaseBrowserClient()
);

// Browser instance for runtime billing visibility config.
export const billingVisibilityPort = createBillingVisibilityPort(
  createSupabaseBrowserClient()
);

// Factory function for server contexts (Route Handlers, Server Components)
export { createSubscriptionRepository } from "./SubscriptionRepository.supabase";
