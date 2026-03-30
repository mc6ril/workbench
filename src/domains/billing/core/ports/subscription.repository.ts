import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/domains/billing/core/domain/subscription.types";

export type SaveSubscriptionInput = {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  customerId?: string | null;
  subscriptionId?: string | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
};

/**
 * Repository contract for Subscription operations.
 * Read operations use the user's auth context (RLS).
 * Write operations require service role (called from webhook handler).
 */
export type SubscriptionRepository = {
  /**
   * Get a subscription by user ID.
   * @returns Subscription or null if user has no subscription (= free plan)
   * @throws DatabaseError if database operation fails
   */
  getByUserId(userId: string): Promise<Subscription | null>;

  /**
   * Create or update a subscription for a user.
   * Must be called with service role client (bypasses RLS).
   * @throws DatabaseError if database operation fails
   */
  save(data: SaveSubscriptionInput): Promise<Subscription>;

  /**
   * Find a subscription by billing customer ID.
   * Used by webhook handlers to look up subscriptions from payment events.
   * Must be called with service role client (bypasses RLS).
   * @returns Subscription or null if not found
   * @throws DatabaseError if database operation fails
   */
  getByCustomerId(customerId: string): Promise<Subscription | null>;

  /**
   * Delete a subscription by user ID (user falls back to free plan).
   * Must be called with service role client (bypasses RLS).
   * @throws DatabaseError if database operation fails
   */
  deleteByUserId(userId: string): Promise<void>;
};
