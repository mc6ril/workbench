import { cookies } from "next/headers";

import { APP_COOKIE_KEYS, getCookie } from "@/shared/infrastructure/storage/cookies";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { listRuntimeConfigEntries } from "@/domains/runtimeConfig/core/usecases/listRuntimeConfigEntries";
import { readRuntimeConfigBooleanOverridesFromCookieValue } from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";
import { createRuntimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/RuntimeConfigPort.supabase";
import RuntimeConfigLabPage from "@/domains/runtimeConfig/presentation/pages/runtimeConfigLab";

const RuntimeConfigLabRoutePage = async () => {
  const supabaseClient = await createSupabaseServerClient();
  const runtimeConfigPort = createRuntimeConfigPort(supabaseClient);
  const [cookieStore, runtimeConfigEntries] = await Promise.all([
    cookies(),
    listRuntimeConfigEntries(runtimeConfigPort),
  ]);
  const runtimeConfigOverrides = readRuntimeConfigBooleanOverridesFromCookieValue(
    getCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES, cookieStore)
  );

  return (
    <RuntimeConfigLabPage
      entries={runtimeConfigEntries}
      initialOverrides={runtimeConfigOverrides}
    />
  );
};

export default RuntimeConfigLabRoutePage;
