import type { SupabaseClient } from "@supabase/supabase-js";

import type { BillingVisibilityPort } from "@/domains/billing/core/ports/billingVisibility.port";

type RuntimeConfigRow = {
  value: unknown;
};

/**
 * Supabase implementation of BillingVisibilityPort.
 * Reads the runtime config entry and returns billing visibility.
 */
export const createBillingVisibilityPort = (
  client: SupabaseClient
): BillingVisibilityPort => ({
  async getBillingVisibility(): Promise<boolean> {
    const { data, error } = await client
      .from("app_runtime_config")
      .select("value")
      .eq("key", "is_billing_visible")
      .maybeSingle();

    if (error) {
      throw error;
    }

    const row = data as RuntimeConfigRow | null;
    const value = row?.value;

    if (typeof value !== "boolean") {
      return false;
    }

    return value;
  },
});
