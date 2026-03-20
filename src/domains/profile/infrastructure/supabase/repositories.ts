import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createUserProfileRepository } from "./userProfile/UserProfileRepository.supabase";

// Browser instance for profile hooks (Client Components)
export const userProfileRepository = createUserProfileRepository(
  createSupabaseBrowserClient()
);

// Factory function for server contexts (Server Components, Route Handlers)
export { createUserProfileRepository } from "./userProfile/UserProfileRepository.supabase";
