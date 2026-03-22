import {
  canAccessFeature,
  getMinimumPlanForFeature,
  type PlanFeature,
} from "@/domains/billing/core/domain/planFeatures.rules";
import type { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.schema";

type ViewLockedState = {
  locked: boolean;
  minimumPlan?: SubscriptionPlan;
};

/**
 * Computes whether a feature is locked for the current effective plan.
 */
export const computeFeatureLockState = (
  requiredFeature: PlanFeature | undefined,
  effectivePlan: SubscriptionPlan
): ViewLockedState => {
  if (!requiredFeature) {
    return { locked: false };
  }
  if (canAccessFeature(effectivePlan, requiredFeature)) {
    return { locked: false };
  }
  return {
    locked: true,
    minimumPlan: getMinimumPlanForFeature(requiredFeature),
  };
};
