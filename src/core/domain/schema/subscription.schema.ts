import { z } from "zod";

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

/**
 * Zod schema for Subscription entity.
 * Validates data coming from the subscriptions table.
 */
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  plan: z.nativeEnum(SubscriptionPlan),
  status: z.nativeEnum(SubscriptionStatus),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  currentPeriodStart: z.coerce.date().nullable(),
  currentPeriodEnd: z.coerce.date().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isSuperuser: z.boolean().optional(),
});

/** Domain subscription entity. */
export type Subscription = z.infer<typeof SubscriptionSchema>;

/**
 * Input for upserting a subscription (from webhook events).
 * Does not include id or timestamps — those are managed by the database.
 */
export const UpsertSubscriptionInputSchema = z.object({
  userId: z.string().uuid(),
  plan: z.nativeEnum(SubscriptionPlan),
  status: z.nativeEnum(SubscriptionStatus),
  stripeCustomerId: z.string().nullable().optional(),
  stripeSubscriptionId: z.string().nullable().optional(),
  currentPeriodStart: z.coerce.date().nullable().optional(),
  currentPeriodEnd: z.coerce.date().nullable().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

export type UpsertSubscriptionInput = z.infer<
  typeof UpsertSubscriptionInputSchema
>;

/** Input for creating a checkout session. */
export type CreateCheckoutParams = {
  userId: string;
  email: string;
  plan: SubscriptionPlan;
  successUrl: string;
  cancelUrl: string;
};

/** Input for creating a billing portal session. */
export type CreateBillingPortalParams = {
  userId: string;
  returnUrl: string;
};

/** Raw webhook payload before parsing. */
export type WebhookParams = {
  rawBody: string;
  signature: string;
};

/** Default free subscription returned when no row exists in the database. */
export const DEFAULT_FREE_SUBSCRIPTION: Omit<
  Subscription,
  "id" | "createdAt" | "updatedAt"
> = {
  userId: "",
  plan: SubscriptionPlan.FREE,
  status: SubscriptionStatus.ACTIVE,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};
