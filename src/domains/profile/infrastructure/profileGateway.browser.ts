import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createProfileGateway } from "./profileGateway.supabase";

export const profileGateway = createProfileGateway(
  createSupabaseBrowserClient()
);
