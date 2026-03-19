import type { SupabaseClient } from "@supabase/supabase-js";

import type { BillingConfigRepository } from "@/domains/billing/core/ports/BillingConfigRepository";

type RuntimeConfigRow = {
  is_billing_visible: boolean;
};

/**
 * Supabase implementation of BillingConfigRepository.
 * Reads the singleton runtime config row and returns billing visibility.
 */
export const createBillingConfigRepository = (
  client: SupabaseClient
): BillingConfigRepository => ({
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
