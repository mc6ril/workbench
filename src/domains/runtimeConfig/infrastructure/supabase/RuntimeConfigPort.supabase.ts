import type { SupabaseClient } from "@supabase/supabase-js";

import type { RuntimeConfigPort } from "@/domains/runtimeConfig/core/ports/runtimeConfig.port";

type RuntimeConfigRow = {
  value: unknown;
};

export const createRuntimeConfigPort = (
  client: SupabaseClient
): RuntimeConfigPort => ({
  async getValue(key: string): Promise<unknown> {
    const { data, error } = await client
      .from("app_runtime_config")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const row = data as RuntimeConfigRow | null;
    return row?.value;
  },
});
