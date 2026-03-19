import type { Subscription } from "@/domains/billing/core/domain/schema/subscription.schema";
import { DEFAULT_FREE_SUBSCRIPTION } from "@/domains/billing/core/domain/schema/subscription.schema";
import type { SubscriptionRepository } from "@/domains/billing/core/ports/subscriptionRepository";

/**
 * Get the current authenticated user's subscription using repository auth context.
 * Returns a default FREE/ACTIVE subscription when no row exists.
 */
export const getCurrentUserSubscription = async (
  repo: SubscriptionRepository
): Promise<Subscription> => {
  const subscription = await repo.getCurrent();

  if (!subscription) {
    return {
      ...DEFAULT_FREE_SUBSCRIPTION,
      id: "00000000-0000-0000-0000-000000000000",
      userId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return subscription;
};
