import {
  canAccessFeature,
  getFeatureLimit,
  getMinimumPlanForFeature,
  PlanFeature,
} from "@/core/domain/rules/planFeatures.rules";
import { SubscriptionPlan } from "@/core/domain/schema/subscription.schema";

describe("Plan Features Domain Rules", () => {
  describe("canAccessFeature", () => {
    describe("boolean features", () => {
      it.each([
        [PlanFeature.EPICS, SubscriptionPlan.FREE, false],
        [PlanFeature.EPICS, SubscriptionPlan.PRO, true],
        [PlanFeature.EPICS, SubscriptionPlan.TEAM, true],
        [PlanFeature.SUBTASKS, SubscriptionPlan.FREE, false],
        [PlanFeature.SUBTASKS, SubscriptionPlan.PRO, true],
        [PlanFeature.SUBTASKS, SubscriptionPlan.TEAM, true],
        [PlanFeature.PRIORITIES, SubscriptionPlan.FREE, false],
        [PlanFeature.PRIORITIES, SubscriptionPlan.PRO, true],
        [PlanFeature.PRIORITIES, SubscriptionPlan.TEAM, true],
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
      ).toBe(3);
      expect(getFeatureLimit(SubscriptionPlan.FREE, PlanFeature.TICKETS)).toBe(
        50
      );
      expect(
        getFeatureLimit(SubscriptionPlan.FREE, PlanFeature.CUSTOM_COLUMNS)
      ).toBe(3);
    });

    it("should return correct limits for PRO plan", () => {
      expect(
        getFeatureLimit(SubscriptionPlan.PRO, PlanFeature.WORKSPACES)
      ).toBe(5);
      expect(
        getFeatureLimit(SubscriptionPlan.PRO, PlanFeature.MEMBERS_PER_WORKSPACE)
      ).toBe(10);
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
      ).toBe(25);
      expect(getFeatureLimit(SubscriptionPlan.TEAM, PlanFeature.TICKETS)).toBe(
        -1
      );
    });

    it("should return -1 for accessible boolean features", () => {
      expect(getFeatureLimit(SubscriptionPlan.PRO, PlanFeature.EPICS)).toBe(-1);
    });

    it("should return 0 for inaccessible boolean features", () => {
      expect(getFeatureLimit(SubscriptionPlan.FREE, PlanFeature.EPICS)).toBe(0);
    });
  });

  describe("getMinimumPlanForFeature", () => {
    it("should return PRO for features available from PRO", () => {
      expect(getMinimumPlanForFeature(PlanFeature.EPICS)).toBe(
        SubscriptionPlan.PRO
      );
      expect(getMinimumPlanForFeature(PlanFeature.SUBTASKS)).toBe(
        SubscriptionPlan.PRO
      );
      expect(getMinimumPlanForFeature(PlanFeature.PRIORITIES)).toBe(
        SubscriptionPlan.PRO
      );
      expect(getMinimumPlanForFeature(PlanFeature.EXPORT_IMPORT)).toBe(
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
      expect(getMinimumPlanForFeature(PlanFeature.CUSTOM_COLUMNS)).toBe(
        SubscriptionPlan.FREE
      );
      expect(getMinimumPlanForFeature(PlanFeature.MEMBERS_PER_WORKSPACE)).toBe(
        SubscriptionPlan.FREE
      );
    });
  });
});
