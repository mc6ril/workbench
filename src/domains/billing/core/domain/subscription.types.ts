/**
 * Available subscription plans.
 * FREE is the default when no subscription row exists.
 */
export enum SubscriptionPlan {
  FREE = "free",
  PRO = "pro",
  TEAM = "team",
}

/**
 * Subscription lifecycle statuses.
 * PAST_DUE indicates a failed payment requiring user action.
 */
export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  PAST_DUE = "past_due",
  TRIALING = "trialing",
}

/** Plan hierarchy used to compare plan tiers (upgrade vs downgrade). */
export const PLAN_RANK: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]: 0,
  [SubscriptionPlan.PRO]: 1,
  [SubscriptionPlan.TEAM]: 2,
};

/** Domain subscription entity. */
export type Subscription = {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  customerId: string | null;
  subscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const FREE_SUBSCRIPTION_VALUES = {
  plan: SubscriptionPlan.FREE,
  status: SubscriptionStatus.ACTIVE,
  customerId: null,
  subscriptionId: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
} satisfies Omit<Subscription, "id" | "userId" | "createdAt" | "updatedAt">;

type CreateFreeSubscriptionParams = {
  id: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Build a free subscription fallback when no persisted subscription exists.
 */
export const createFreeSubscription = ({
  id,
  userId,
  createdAt = new Date(),
  updatedAt = new Date(),
}: CreateFreeSubscriptionParams): Subscription => ({
  ...FREE_SUBSCRIPTION_VALUES,
  id,
  userId,
  createdAt,
  updatedAt,
});

/**
 * Superusers are treated as TEAM for entitlement checks without requiring a paid row.
 */
