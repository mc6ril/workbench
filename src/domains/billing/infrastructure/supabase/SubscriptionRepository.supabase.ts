import type { SupabaseClient } from "@supabase/supabase-js";

import { createDatabaseError } from "@/domains/project-management/core/domain/repositoryError";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import type { SubscriptionRow } from "@/infrastructure/supabase/types";

import { mapSubscriptionRowToDomain } from "./SubscriptionMapper.supabase";

import type {
  Subscription,
  UpsertSubscriptionInput,
} from "@/domains/billing/core/domain/schema/subscription.schema";
import type { SubscriptionRepository } from "@/domains/billing/core/ports/subscriptionRepository";

/**
 * Create a SubscriptionRepository using the provided Supabase clients.
 *
 * @param browserClient - Supabase client with user auth context (for reads via RLS)
 * @param adminClient - Supabase admin client with service role (for writes bypassing RLS)
 */
export const createSubscriptionRepository = (
  browserClient: SupabaseClient,
  adminClient: SupabaseClient
): SubscriptionRepository => ({
  async getCurrent(): Promise<Subscription | null> {
    try {
      const { data, error } = await browserClient
        .from("subscriptions")
        .select("*")
        .maybeSingle();

      if (error) {
        return handleRepositoryError(error, "Subscription");
      }

      if (!data) {
        return null;
      }

      return mapSubscriptionRowToDomain(data as SubscriptionRow);
    } catch (error) {
      return handleRepositoryError(error, "Subscription");
    }
  },

  async getByUserId(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await browserClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        return handleRepositoryError(error, "Subscription");
      }

      if (!data) {
        return null;
      }

      return mapSubscriptionRowToDomain(data as SubscriptionRow);
    } catch (error) {
      return handleRepositoryError(error, "Subscription");
    }
  },

  async upsert(input: UpsertSubscriptionInput): Promise<Subscription> {
    try {
      const row: Record<string, unknown> = {
        user_id: input.userId,
        plan: input.plan,
        status: input.status,
      };

      if (input.stripeCustomerId !== undefined) {
        row.stripe_customer_id = input.stripeCustomerId;
      }
      if (input.stripeSubscriptionId !== undefined) {
        row.stripe_subscription_id = input.stripeSubscriptionId;
      }
      if (input.currentPeriodStart !== undefined) {
        row.current_period_start =
          input.currentPeriodStart?.toISOString() ?? null;
      }
      if (input.currentPeriodEnd !== undefined) {
        row.current_period_end = input.currentPeriodEnd?.toISOString() ?? null;
      }
      if (input.cancelAtPeriodEnd !== undefined) {
        row.cancel_at_period_end = input.cancelAtPeriodEnd;
      }

      const { data, error } = await adminClient
        .from("subscriptions")
        .upsert(row, { onConflict: "user_id" })
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Subscription");
      }

      if (!data) {
        return handleRepositoryError(
          createDatabaseError("No subscription data returned after upsert"),
          "Subscription"
        );
      }

      return mapSubscriptionRowToDomain(data as SubscriptionRow);
    } catch (error) {
      return handleRepositoryError(error, "Subscription");
    }
  },

  async getByStripeCustomerId(
    stripeCustomerId: string
  ): Promise<Subscription | null> {
    try {
      const { data, error } = await adminClient
        .from("subscriptions")
        .select("*")
        .eq("stripe_customer_id", stripeCustomerId)
        .maybeSingle();

      if (error) {
        return handleRepositoryError(error, "Subscription");
      }

      if (!data) {
        return null;
      }

      return mapSubscriptionRowToDomain(data as SubscriptionRow);
    } catch (error) {
      return handleRepositoryError(error, "Subscription");
    }
  },

  async deleteByUserId(userId: string): Promise<void> {
    try {
      const { error } = await adminClient
        .from("subscriptions")
        .delete()
        .eq("user_id", userId);

      if (error) {
        return handleRepositoryError(error, "Subscription");
      }
    } catch (error) {
      return handleRepositoryError(error, "Subscription");
    }
  },
});
