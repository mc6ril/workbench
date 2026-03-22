import type { Subscription } from "@/domains/billing/core/domain/subscription.schema";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/domains/billing/core/domain/subscription.schema";
import type { SubscriptionRow } from "@/domains/billing/infrastructure/supabase/types";

/**
 * Maps a Supabase subscription row to a domain Subscription entity.
 * Translates snake_case database fields to camelCase domain fields.
 */
export const mapSubscriptionRowToDomain = (
  row: SubscriptionRow
): Subscription => ({
  id: row.id,
  userId: row.user_id,
  plan: row.plan as SubscriptionPlan,
  status: row.status as SubscriptionStatus,
  stripeCustomerId: row.stripe_customer_id,
  stripeSubscriptionId: row.stripe_subscription_id,
  currentPeriodStart: row.current_period_start
    ? new Date(row.current_period_start)
    : null,
  currentPeriodEnd: row.current_period_end
    ? new Date(row.current_period_end)
    : null,
  cancelAtPeriodEnd: row.cancel_at_period_end,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});
