import { useMemo } from "react";

import type {
  FeatureAccessResult,
  PlanFeature,
} from "@/domains/billing/core/domain/rules/planFeatures.rules";
import { getMinimumPlanForFeature } from "@/domains/billing/core/domain/rules/planFeatures.rules";
import { SubscriptionPlan } from "@/domains/billing/core/domain/schema/subscription.schema";
import { checkFeatureAccess } from "@/domains/billing/core/usecases/checkFeatureAccess";
import { useSubscription } from "@/domains/billing/presentation/hooks/useSubscription";

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
