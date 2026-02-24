import {
  canAccessFeature,
  getMinimumPlanForFeature,
  type PlanFeature,
} from "@/core/domain/rules/planFeatures.rules";
import type { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

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
