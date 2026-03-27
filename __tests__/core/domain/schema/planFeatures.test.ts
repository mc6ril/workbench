import {
  canAccessFeature,
  getEffectivePlan,
  getFeatureLimit,
  getMinimumPlanForFeature,
  PlanFeature,
} from "@/domains/billing/core/domain/planFeatures.rules";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/domains/billing/core/domain/subscription.schema";

describe("Plan Features Domain Rules", () => {
  describe("canAccessFeature", () => {
    describe("boolean features", () => {
      it.each([
        [PlanFeature.EXPORT_IMPORT, SubscriptionPlan.FREE, false],
        [PlanFeature.EXPORT_IMPORT, SubscriptionPlan.PRO, true],
        [PlanFeature.EXPORT_IMPORT, SubscriptionPlan.TEAM, true],
        [PlanFeature.ADVANCED_ROLES, SubscriptionPlan.FREE, false],
        [PlanFeature.ADVANCED_ROLES, SubscriptionPlan.PRO, false],
        [PlanFeature.ADVANCED_ROLES, SubscriptionPlan.TEAM, true],
      ])(
        "should return %s for %s plan on feature %s",
        (feature, plan, expected) => {
          expect(canAccessFeature(plan, feature)).toBe(expected);
        }
      );
    });

    describe("limit features", () => {
      it("should return true for limit features with non-zero limits", () => {
        expect(
          canAccessFeature(SubscriptionPlan.FREE, PlanFeature.WORKSPACES)
        ).toBe(true);
        expect(
          canAccessFeature(SubscriptionPlan.FREE, PlanFeature.TICKETS)
        ).toBe(true);
        expect(
          canAccessFeature(SubscriptionPlan.PRO, PlanFeature.WORKSPACES)
        ).toBe(true);
      });
    });
  });

  describe("getFeatureLimit", () => {
    it("should return correct limits for FREE plan", () => {
      expect(
        getFeatureLimit(SubscriptionPlan.FREE, PlanFeature.WORKSPACES)
      ).toBe(1);
      expect(
        getFeatureLimit(
          SubscriptionPlan.FREE,
          PlanFeature.MEMBERS_PER_WORKSPACE
        )
      ).toBe(2);
      expect(getFeatureLimit(SubscriptionPlan.FREE, PlanFeature.TICKETS)).toBe(
        100
      );
      expect(
        getFeatureLimit(SubscriptionPlan.FREE, PlanFeature.CUSTOM_COLUMNS)
      ).toBe(0);
    });

    it("should return correct limits for PRO plan", () => {
      expect(
        getFeatureLimit(SubscriptionPlan.PRO, PlanFeature.WORKSPACES)
      ).toBe(5);
      expect(
        getFeatureLimit(SubscriptionPlan.PRO, PlanFeature.MEMBERS_PER_WORKSPACE)
      ).toBe(4);
      expect(getFeatureLimit(SubscriptionPlan.PRO, PlanFeature.TICKETS)).toBe(
        -1
      );
      expect(
        getFeatureLimit(SubscriptionPlan.PRO, PlanFeature.CUSTOM_COLUMNS)
      ).toBe(-1);
    });

    it("should return correct limits for TEAM plan", () => {
      expect(
        getFeatureLimit(SubscriptionPlan.TEAM, PlanFeature.WORKSPACES)
      ).toBe(-1);
      expect(
        getFeatureLimit(
          SubscriptionPlan.TEAM,
          PlanFeature.MEMBERS_PER_WORKSPACE
        )
      ).toBe(20);
      expect(getFeatureLimit(SubscriptionPlan.TEAM, PlanFeature.TICKETS)).toBe(
        -1
      );
    });

    it("should return -1 for accessible boolean features", () => {
      expect(
        getFeatureLimit(SubscriptionPlan.PRO, PlanFeature.EXPORT_IMPORT)
      ).toBe(-1);
    });

    it("should return 0 for inaccessible boolean features", () => {
      expect(
        getFeatureLimit(SubscriptionPlan.FREE, PlanFeature.EXPORT_IMPORT)
      ).toBe(0);
    });
  });

  describe("getMinimumPlanForFeature", () => {
    it("should return PRO for features available from PRO", () => {
      expect(getMinimumPlanForFeature(PlanFeature.EXPORT_IMPORT)).toBe(
        SubscriptionPlan.PRO
      );
      expect(getMinimumPlanForFeature(PlanFeature.CUSTOM_COLUMNS)).toBe(
        SubscriptionPlan.PRO
      );
    });

    it("should return TEAM for features only available in TEAM", () => {
      expect(getMinimumPlanForFeature(PlanFeature.ADVANCED_ROLES)).toBe(
        SubscriptionPlan.TEAM
      );
    });

    it("should return FREE for limit features available in all plans", () => {
      expect(getMinimumPlanForFeature(PlanFeature.WORKSPACES)).toBe(
        SubscriptionPlan.FREE
      );
      expect(getMinimumPlanForFeature(PlanFeature.TICKETS)).toBe(
        SubscriptionPlan.FREE
      );
      expect(getMinimumPlanForFeature(PlanFeature.MEMBERS_PER_WORKSPACE)).toBe(
        SubscriptionPlan.FREE
      );
    });
  });

  describe("getEffectivePlan", () => {
    const createSubscription = (
      overrides?: Partial<{
        plan: SubscriptionPlan;
        status: SubscriptionStatus;
        isSuperuser: boolean;
      }>
    ) => ({
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "223e4567-e89b-12d3-a456-426614174000",
      plan: overrides?.plan ?? SubscriptionPlan.PRO,
      status: overrides?.status ?? SubscriptionStatus.ACTIVE,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      isSuperuser: overrides?.isSuperuser ?? false,
    });

    it("returns TEAM for superuser regardless of plan/status", () => {
      const subscription = createSubscription({
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.CANCELED,
        isSuperuser: true,
      });

      expect(getEffectivePlan(subscription)).toBe(SubscriptionPlan.TEAM);
    });

    it("returns FREE for canceled or past-due subscriptions", () => {
      expect(
        getEffectivePlan(
          createSubscription({
            plan: SubscriptionPlan.TEAM,
            status: SubscriptionStatus.CANCELED,
          })
        )
      ).toBe(SubscriptionPlan.FREE);

      expect(
        getEffectivePlan(
          createSubscription({
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.PAST_DUE,
          })
        )
      ).toBe(SubscriptionPlan.FREE);
    });

    it("returns current plan for healthy subscriptions", () => {
      expect(
        getEffectivePlan(
          createSubscription({
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.ACTIVE,
          })
        )
      ).toBe(SubscriptionPlan.PRO);

      expect(
        getEffectivePlan(
          createSubscription({
            plan: SubscriptionPlan.TEAM,
            status: SubscriptionStatus.TRIALING,
          })
        )
      ).toBe(SubscriptionPlan.TEAM);
    });
  });
});
