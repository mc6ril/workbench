import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/domains/project-management/core/domain/schema/subscription.schema";

import { getCurrentUserSubscription } from "@/domains/project-management/core/usecases/subscription/getCurrentUserSubscription";

import { subscriptionRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { useSession } from "@/presentation/hooks/auth/useSession";
import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

/**
 * Hook for fetching the current user's subscription.
 * Automatically handles super user detection via session data.
 *
 * @returns React Query hook result with subscription data, loading state, and error
 */
export const useSubscription = () => {
  const { data: session } = useSession();
  const queryResult = useQuery({
    queryKey: queryKeys.subscription.current(),
    queryFn: () => getCurrentUserSubscription(subscriptionRepository),
    enabled: !!session?.userId,
  });
  const { data: queryData } = queryResult;

  const data = useMemo(() => {
    if (!session || !queryData) {
      return undefined;
    }

    if (session.isSuperuser) {
      return {
        ...queryData,
        userId: session.userId,
        plan: SubscriptionPlan.TEAM,
        status: SubscriptionStatus.ACTIVE,
        isSuperuser: true,
      };
    }

    if (queryData.userId === "") {
      return {
        ...queryData,
        userId: session.userId,
      };
    }

    return queryData;
  }, [queryData, session]);

  return {
    ...queryResult,
    data,
  };
};
