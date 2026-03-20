import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createAuthRepository } from "./AuthRepository.supabase";

import { createUserProfileRepository } from "@/domains/profile/infrastructure/supabase/userProfile/UserProfileRepository.supabase";

// Browser instance for auth hooks (Client Components)
export const authRepository = createAuthRepository(
  createSupabaseBrowserClient()
);
export const userProfileRepository = createUserProfileRepository(
  createSupabaseBrowserClient()
);

// Factory function for server contexts (Server Components, Route Handlers)
export { createAuthRepository } from "./AuthRepository.supabase";
export { createUserProfileRepository } from "@/domains/profile/infrastructure/supabase/userProfile/UserProfileRepository.supabase";
