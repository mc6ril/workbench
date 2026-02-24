import { useMemo } from "react";

import type {
  FeatureAccessResult,
  PlanFeature,
} from "@/core/domain/rules/planFeatures.rules";
import { getMinimumPlanForFeature } from "@/core/domain/rules/planFeatures.rules";
import { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

import { checkFeatureAccess } from "@/core/usecases/subscription/checkFeatureAccess";

import { useSubscription } from "@/presentation/hooks/subscription/useSubscription";

/**
 * Hook to check whether the current user's subscription grants access to a feature.
 * Returns access status, the minimum plan required, and loading state.
 */
export const useFeatureAccess = (
  feature: PlanFeature
): FeatureAccessResult & { isLoading: boolean } => {
  const { data: subscription, isLoading } = useSubscription();

  const result = useMemo((): FeatureAccessResult => {
    if (!subscription) {
      return {
        hasAccess: false,
        currentPlan: SubscriptionPlan.FREE,
        minimumPlan: getMinimumPlanForFeature(feature),
        limit: undefined,
      };
    }

    return checkFeatureAccess(subscription, feature);
  }, [subscription, feature]);

  return {
    ...result,
    isLoading,
  };
};
