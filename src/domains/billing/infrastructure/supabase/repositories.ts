import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createBillingConfigRepository } from "./BillingConfigRepository.supabase";
import { createSubscriptionRepository } from "./SubscriptionRepository.supabase";

// Browser instance for billing hooks (Client Components)
export const subscriptionRepository = createSubscriptionRepository(
  createSupabaseBrowserClient(),
  createSupabaseBrowserClient()
);

// Browser instance for runtime billing visibility config.
export const billingConfigRepository = createBillingConfigRepository(
  createSupabaseBrowserClient()
);

// Factory function for server contexts (Route Handlers, Server Components)
export { createSubscriptionRepository } from "./SubscriptionRepository.supabase";
