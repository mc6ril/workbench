import { useQuery } from "@tanstack/react-query";

import { canUpdatePassword } from "@/domains/auth/core/usecases/password/canUpdatePassword";
import { authRepository } from "@/domains/auth/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/auth/presentation/hooks/queryKeys";

/**
 * Returns whether the current authenticated user can manage a password.
 */
export const useCanUpdatePassword = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.auth.passwordCapability(),
    queryFn: () => canUpdatePassword(authRepository),
    enabled,
  });
};
