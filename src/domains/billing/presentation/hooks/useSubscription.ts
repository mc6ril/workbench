import { useQuery } from "@tanstack/react-query";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { getUserSubscription } from "@/domains/billing/core/usecases/getUserSubscription";
import { subscriptionRepository } from "@/domains/billing/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/billing/presentation/hooks/queryKeys";

/**
 * Hook for fetching the current user's subscription.
 *
 * @returns React Query hook result with subscription data, loading state, and error
 */
export const useSubscription = () => {
  const { data: identity } = useAuthIdentity();
  return useQuery({
    queryKey: queryKeys.subscription.current(),
    queryFn: () =>
      getUserSubscription(subscriptionRepository, {
        userId: identity!.userId,
      }),
    enabled: !!identity?.userId,
  });
};
