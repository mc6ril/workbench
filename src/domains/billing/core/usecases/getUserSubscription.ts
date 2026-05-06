import { z } from "zod";

import type { Subscription } from "@/domains/billing/core/domain/subscription.types";
import { createFreeSubscription } from "@/domains/billing/core/domain/subscription.types";
import type { SubscriptionRepository } from "@/domains/billing/core/ports/subscription.repository";

const GetUserSubscriptionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

type GetUserSubscriptionInput = z.infer<typeof GetUserSubscriptionSchema>;

/**
 * Get the current user's subscription.
 * Returns a default FREE/ACTIVE subscription when no row exists.
 */
export const getUserSubscription = async (
  subscriptionRepository: SubscriptionRepository,
  input: GetUserSubscriptionInput
): Promise<Subscription> => {
  const { userId } = GetUserSubscriptionSchema.parse(input);

  const subscription = await subscriptionRepository.getByUserId(userId);

  if (!subscription) {
    return createFreeSubscription({
      id: "default-free",
      userId,
    });
  }

  return subscription;
};
