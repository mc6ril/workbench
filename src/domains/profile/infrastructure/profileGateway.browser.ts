import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { createProfileGateway } from "./profileGateway.supabase";

export const profileGateway = createProfileGateway(
  createSupabaseBrowserClient()
);
