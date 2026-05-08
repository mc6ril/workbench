import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import type { RuntimeConfigEntry } from "@/domains/runtimeConfig/core/domain/runtimeConfig.types";
import type { RuntimeConfigPort } from "@/domains/runtimeConfig/core/ports/runtimeConfig.port";

export const createRuntimeConfigPort = (
  client: AppSupabaseClient
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

    return data?.value;
  },

  async listEntries(): Promise<RuntimeConfigEntry[]> {
    const { data, error } = await client
      .from("app_runtime_config")
      .select("key, value")
      .order("key", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((entry) => ({
      key: entry.key,
      value: entry.value,
    }));
  },
});
