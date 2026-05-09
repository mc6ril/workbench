import { unstable_cache } from "next/cache";

import { createSupabaseAnonServerClient } from "@/shared/infrastructure/supabase/server";

import "server-only";
import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";
import { createRuntimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/RuntimeConfigPort.supabase";

const fetchRuntimeConfigBoolean = unstable_cache(
  async (key: string, defaultValue: boolean): Promise<boolean> => {
    const client = createSupabaseAnonServerClient();
    const port = createRuntimeConfigPort(client);
    return getRuntimeConfigBoolean(port, { key, defaultValue });
  },
  ["runtime-config-boolean"],
  { revalidate: 86400 }
);

export const getCachedRuntimeConfigBoolean = (
  key: string,
  defaultValue: boolean
): Promise<boolean> => fetchRuntimeConfigBoolean(key, defaultValue);
