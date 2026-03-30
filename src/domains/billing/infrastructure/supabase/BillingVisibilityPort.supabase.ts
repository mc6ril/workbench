import type { SupabaseClient } from "@supabase/supabase-js";

import type { BillingVisibilityPort } from "@/domains/billing/core/ports/billingVisibility.port";

type RuntimeConfigRow = {
  is_billing_visible: boolean;
};

/**
 * Supabase implementation of BillingVisibilityPort.
 * Reads the singleton runtime config row and returns billing visibility.
 */
export const createBillingVisibilityPort = (
  client: SupabaseClient
): BillingVisibilityPort => ({
  async getBillingVisibility(): Promise<boolean> {
    const { data, error } = await client
      .from("app_runtime_config")
      .select("is_billing_visible")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const row = data as RuntimeConfigRow | null;
    return row?.is_billing_visible ?? false;
  },
});
