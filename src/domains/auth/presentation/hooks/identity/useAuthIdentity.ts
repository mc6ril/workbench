import { useQuery } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { getCurrentAuthIdentity } from "@/domains/auth/infrastructure/supabase/currentAuthIdentity";
import { queryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";

const authIdentityClient = createSupabaseBrowserClient();

type UseAuthIdentityOptions = {
  enabled?: boolean;
  queryKeySuffix?: readonly unknown[];
};

export const useAuthIdentity = (options: UseAuthIdentityOptions = {}) => {
  const { enabled = true, queryKeySuffix = [] } = options;

  return useQuery({
    queryKey: [...queryKeys.authIdentity.current(), ...queryKeySuffix],
    queryFn: () => getCurrentAuthIdentity(authIdentityClient),
    enabled,
    retry: false,
  });
};
