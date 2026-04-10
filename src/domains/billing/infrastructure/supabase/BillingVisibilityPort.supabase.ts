import type { SupabaseClient } from "@supabase/supabase-js";

import type { BillingVisibilityPort } from "@/domains/billing/core/ports/billingVisibility.port";

type RuntimeConfigRow = {
  value: unknown;
};

type LegacyRuntimeConfigRow = {
  is_billing_visible: boolean;
};

/**
 * Supabase implementation of BillingVisibilityPort.
 * Reads the key/value runtime config entry and falls back to the legacy
 * singleton schema while older databases are still being migrated.
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

    if (!error) {
      const row = data as RuntimeConfigRow | null;
      const value = row?.value;

      if (typeof value !== "boolean") {
        return false;
      }

      return value;
    }

    const { data: legacyData, error: legacyError } = await client
      .from("app_runtime_config")
      .select("is_billing_visible")
      .eq("id", 1)
      .maybeSingle();

    if (legacyError) {
      throw error;
    }

    const legacyRow = legacyData as LegacyRuntimeConfigRow | null;
    return legacyRow?.is_billing_visible ?? false;
  },
});
