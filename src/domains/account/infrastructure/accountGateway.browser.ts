import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { createAccountGateway } from "./accountGateway.supabase";

export const accountGateway = createAccountGateway(
  createSupabaseBrowserClient()
);
