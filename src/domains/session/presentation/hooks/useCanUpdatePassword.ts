import { useQuery } from "@tanstack/react-query";

import { canUpdatePassword } from "@/domains/session/core/usecases/canUpdatePassword";
import { sessionGateway } from "@/domains/session/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/session/presentation/hooks/queryKeys";

export const useCanUpdatePassword = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.session.passwordCapability(),
    queryFn: () => canUpdatePassword(sessionGateway),
    enabled,
  });
};
