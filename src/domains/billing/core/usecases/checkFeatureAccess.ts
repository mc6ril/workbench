import type {
  FeatureAccessResult,
  PlanFeature,
} from "@/domains/billing/core/domain/planFeatures.rules";
import {
  canAccessFeature,
  getEffectivePlan,
  getFeatureLimit,
  getMinimumPlanForFeature,
} from "@/domains/billing/core/domain/planFeatures.rules";
import type { Subscription } from "@/domains/billing/core/domain/subscription.schema";

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
