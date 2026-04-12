import type { SupabaseClient } from "@supabase/supabase-js";

import type { RuntimeConfigEntry } from "@/domains/runtimeConfig/core/domain/runtimeConfig.types";
import type { RuntimeConfigPort } from "@/domains/runtimeConfig/core/ports/runtimeConfig.port";

type RuntimeConfigRow = {
  key: string;
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

  async listEntries(): Promise<RuntimeConfigEntry[]> {
    const { data, error } = await client
      .from("app_runtime_config")
      .select("key, value")
      .order("key", { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as RuntimeConfigRow[]).map((entry) => ({
      key: entry.key,
      value: entry.value,
    }));
  },
});
