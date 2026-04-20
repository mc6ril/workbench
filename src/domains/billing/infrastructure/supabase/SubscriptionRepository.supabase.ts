import type { SupabaseClient } from "@supabase/supabase-js";

import { createDatabaseError } from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import { mapSubscriptionRowToDomain } from "./SubscriptionMapper.supabase";

import type { Subscription } from "@/domains/billing/core/domain/subscription.types";
import type {
  SaveSubscriptionInput,
  SubscriptionRepository,
} from "@/domains/billing/core/ports/subscription.repository";
import type { SubscriptionRow } from "@/domains/billing/infrastructure/supabase/types";

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

  async save(input: SaveSubscriptionInput): Promise<Subscription> {
    try {
      const row: Record<string, unknown> = {
        user_id: input.userId,
        plan: input.plan,
        status: input.status,
      };

      if (input.customerId !== undefined) {
        row.stripe_customer_id = input.customerId;
      }
      if (input.subscriptionId !== undefined) {
        row.stripe_subscription_id = input.subscriptionId;
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

  async getByCustomerId(customerId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await adminClient
        .from("subscriptions")
        .select("*")
        .eq("stripe_customer_id", customerId)
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
