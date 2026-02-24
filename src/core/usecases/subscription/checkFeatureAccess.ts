import type {
  FeatureAccessResult,
  PlanFeature,
} from "@/core/domain/rules/planFeatures.rules";
import {
  canAccessFeature,
  getEffectivePlan,
  getFeatureLimit,
  getMinimumPlanForFeature,
} from "@/core/domain/rules/planFeatures.rules";
import type { Subscription } from "@/core/domain/schema/subscription.schema";

/**
 * Check whether a subscription grants access to a given feature.
 * Handles superuser bypass and degraded subscription statuses (canceled / past_due → FREE).
 */
export const checkFeatureAccess = (
  subscription: Subscription,
  feature: PlanFeature
): FeatureAccessResult => {
  const effectivePlan = getEffectivePlan(subscription);
  const minimumPlan = getMinimumPlanForFeature(feature);
  const hasAccess = canAccessFeature(effectivePlan, feature);
  const limit = getFeatureLimit(effectivePlan, feature);

  return {
    hasAccess,
    currentPlan: effectivePlan,
    minimumPlan,
    limit: limit >= 0 ? limit : undefined,
  };
};
