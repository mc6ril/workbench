import { useQuery } from "@tanstack/react-query";

import { getUserSubscription } from "@/domains/billing/core/usecases/getUserSubscription";
import { subscriptionRepository } from "@/domains/billing/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/billing/presentation/hooks/queryKeys";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

/**
 * Hook for fetching the current user's subscription.
 * Automatically handles super user detection via session data.
 *
 * @returns React Query hook result with subscription data, loading state, and error
 */
export const useSubscription = () => {
  const { data: session } = useSession();
  return useQuery({
    queryKey: queryKeys.subscription.current(),
    queryFn: () =>
      getUserSubscription(subscriptionRepository, {
        userId: session!.userId,
        isSuperuser: session?.isSuperuser,
      }),
    enabled: !!session?.userId,
  });
};
