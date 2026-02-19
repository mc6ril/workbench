import type { Subscription } from "@/core/domain/schema/subscription.schema";
import {
  DEFAULT_FREE_SUBSCRIPTION,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/core/domain/schema/subscription.schema";

import type { SubscriptionRepository } from "@/core/ports/subscriptionRepository";

/**
 * Get the current user's subscription.
 * Returns a default FREE/ACTIVE subscription when no row exists.
 * If isSuperuser is true, returns a virtual TEAM/ACTIVE subscription with full access.
 */
export const getUserSubscription = async (
  repo: SubscriptionRepository,
  userId: string,
  isSuperuser: boolean = false
): Promise<Subscription> => {
  if (isSuperuser) {
    return {
      ...DEFAULT_FREE_SUBSCRIPTION,
      id: "superuser",
      userId,
      plan: SubscriptionPlan.TEAM,
      status: SubscriptionStatus.ACTIVE,
      isSuperuser: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const subscription = await repo.getByUserId(userId);

  if (!subscription) {
    return {
      ...DEFAULT_FREE_SUBSCRIPTION,
      id: "default-free",
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return subscription;
};
