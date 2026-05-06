import { unstable_cache } from "next/cache";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import "server-only";
import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { createBillingVisibilityPort } from "@/domains/billing/infrastructure/supabase/BillingVisibilityPort.supabase";

const getBillingVisibilityUncached = async () => {
  const client = createSupabaseBrowserClient();
  const billingVisibilityPort = createBillingVisibilityPort(client);

  return getBillingVisibility(billingVisibilityPort);
};

export const getCachedBillingVisibility = unstable_cache(
  getBillingVisibilityUncached,
  ["billing-visibility"],
  {
    revalidate: 300,
  }
);
