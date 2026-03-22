import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createUserProfileRepository } from "./UserProfileRepository.supabase";

export const userProfileRepository = createUserProfileRepository(
  createSupabaseBrowserClient()
);
