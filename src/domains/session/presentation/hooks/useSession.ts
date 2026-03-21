import { useQuery } from "@tanstack/react-query";

import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { sessionRepository } from "@/domains/session/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/session/presentation/hooks/queryKeys";

export const useSession = () => {
  return useQuery({
    queryKey: queryKeys.session.current(),
    queryFn: () => getCurrentSession(sessionRepository),
  });
};
