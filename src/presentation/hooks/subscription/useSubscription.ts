import { useQuery } from "@tanstack/react-query";

import { getUserSubscription } from "@/core/usecases/subscription/getUserSubscription";

import { subscriptionRepository } from "@/infrastructure/supabase/repositories";

import { useSession } from "@/presentation/hooks/auth/useSession";
import { queryKeys } from "@/presentation/hooks/queryKeys";

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
      getUserSubscription(
        subscriptionRepository,
        session!.userId,
        session?.isSuperuser ?? false
      ),
    enabled: !!session,
  });
};
