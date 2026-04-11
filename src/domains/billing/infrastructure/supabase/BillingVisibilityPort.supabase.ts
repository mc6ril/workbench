import type { SupabaseClient } from "@supabase/supabase-js";

import type { BillingVisibilityPort } from "@/domains/billing/core/ports/billingVisibility.port";
import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";
import { createRuntimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/RuntimeConfigPort.supabase";

/**
 * Supabase implementation of BillingVisibilityPort.
 * Reads billing visibility from the shared runtime config domain.
 */
export const createBillingVisibilityPort = (
  client: SupabaseClient
): BillingVisibilityPort => {
  const runtimeConfigPort = createRuntimeConfigPort(client);

  return {
    async getBillingVisibility(): Promise<boolean> {
      return getRuntimeConfigBoolean(runtimeConfigPort, {
        key: "is_billing_visible",
        defaultValue: false,
      });
    },
  };
};
