import { PlanFeature } from "@/core/domain/rules/planFeatures.rules";
import type { Subscription } from "@/core/domain/schema/subscription.schema";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/core/domain/schema/subscription.schema";

import { checkFeatureAccess } from "@/core/usecases/subscription/checkFeatureAccess";

describe("checkFeatureAccess", () => {
  const createMockSubscription = (
    overrides?: Partial<Subscription>
  ): Subscription => ({
    id: "sub-1",
    userId: "user-1",
    plan: SubscriptionPlan.FREE,
    status: SubscriptionStatus.ACTIVE,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("active subscriptions", () => {
    it("should grant epics access for FREE plan", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.FREE,
      });

      const result = checkFeatureAccess(subscription, PlanFeature.EPICS);

      expect(result.hasAccess).toBe(true);
      expect(result.currentPlan).toBe(SubscriptionPlan.FREE);
    });

    it("should deny backlog access for FREE plan", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.FREE,
      });

      const result = checkFeatureAccess(subscription, PlanFeature.BACKLOG_VIEW);

      expect(result.hasAccess).toBe(false);
      expect(result.currentPlan).toBe(SubscriptionPlan.FREE);
      expect(result.minimumPlan).toBe(SubscriptionPlan.PRO);
    });

    it("should grant epics access for PRO plan", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.PRO,
      });

      const result = checkFeatureAccess(subscription, PlanFeature.EPICS);

      expect(result.hasAccess).toBe(true);
      expect(result.currentPlan).toBe(SubscriptionPlan.PRO);
    });

    it("should grant epics access for TEAM plan", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.TEAM,
      });

      const result = checkFeatureAccess(subscription, PlanFeature.EPICS);

      expect(result.hasAccess).toBe(true);
      expect(result.currentPlan).toBe(SubscriptionPlan.TEAM);
    });

    it("should deny advanced roles for PRO plan", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.PRO,
      });

      const result = checkFeatureAccess(
        subscription,
        PlanFeature.ADVANCED_ROLES
      );

      expect(result.hasAccess).toBe(false);
      expect(result.minimumPlan).toBe(SubscriptionPlan.TEAM);
    });

    it("should return limit for workspace feature on FREE plan", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.FREE,
      });

      const result = checkFeatureAccess(subscription, PlanFeature.WORKSPACES);

      expect(result.hasAccess).toBe(true);
      expect(result.limit).toBe(1);
    });

    it("should return undefined limit for unlimited features", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.PRO,
      });

      const result = checkFeatureAccess(subscription, PlanFeature.TICKETS);

      expect(result.hasAccess).toBe(true);
      expect(result.limit).toBeUndefined();
    });
  });

  describe("superuser bypass", () => {
    it("should grant full access to superusers regardless of plan", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.FREE,
        isSuperuser: true,
      });

      const result = checkFeatureAccess(
        subscription,
        PlanFeature.ADVANCED_ROLES
      );

      expect(result.hasAccess).toBe(true);
      expect(result.currentPlan).toBe(SubscriptionPlan.TEAM);
    });

    it("should grant epics access to superusers on FREE plan", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.FREE,
        isSuperuser: true,
      });

      const result = checkFeatureAccess(subscription, PlanFeature.EPICS);

      expect(result.hasAccess).toBe(true);
    });
  });

  describe("degraded subscription statuses", () => {
    it("should downgrade canceled PRO subscription to FREE capabilities", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.CANCELED,
      });

      const result = checkFeatureAccess(subscription, PlanFeature.BACKLOG_VIEW);

      expect(result.hasAccess).toBe(false);
      expect(result.currentPlan).toBe(SubscriptionPlan.FREE);
    });

    it("should downgrade past_due TEAM subscription to FREE capabilities", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.TEAM,
        status: SubscriptionStatus.PAST_DUE,
      });

      const result = checkFeatureAccess(
        subscription,
        PlanFeature.ADVANCED_ROLES
      );

      expect(result.hasAccess).toBe(false);
      expect(result.currentPlan).toBe(SubscriptionPlan.FREE);
    });

    it("should keep access for trialing subscriptions", () => {
      const subscription = createMockSubscription({
        plan: SubscriptionPlan.PRO,
        status: SubscriptionStatus.TRIALING,
      });

      const result = checkFeatureAccess(subscription, PlanFeature.EPICS);

      expect(result.hasAccess).toBe(true);
      expect(result.currentPlan).toBe(SubscriptionPlan.PRO);
    });
  });
});
