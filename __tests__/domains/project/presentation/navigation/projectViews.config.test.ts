import { PROJECT_VIEWS } from "@/shared/constants/routes";

import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import {
  canAccessProjectView,
  getDefaultProjectViewKey,
  getProjectViewFeatureLockState,
  isProjectViewModuleEnabled,
} from "@/domains/project/presentation/navigation/projectViews.config";

describe("projectViews.config", () => {
  it("keeps Recipes disabled until the project module is enabled", () => {
    expect(isProjectViewModuleEnabled(PROJECT_VIEWS.RECIPES, [])).toBe(false);
    expect(
      isProjectViewModuleEnabled(PROJECT_VIEWS.RECIPES, [
        ProjectModuleKey.RECIPES,
      ])
    ).toBe(true);
  });

  it("prefers the Recipes landing view when the module is enabled", () => {
    expect(
      getDefaultProjectViewKey({
        enabledModules: [ProjectModuleKey.RECIPES],
        effectivePlan: SubscriptionPlan.FREE,
      })
    ).toBe(PROJECT_VIEWS.RECIPES);
  });

  it("falls back to Board when Recipes is not enabled", () => {
    expect(
      getDefaultProjectViewKey({
        enabledModules: [],
        effectivePlan: SubscriptionPlan.FREE,
      })
    ).toBe(PROJECT_VIEWS.BOARD);
  });

  it("reports Recipes as accessible once the module is enabled", () => {
    expect(
      canAccessProjectView(PROJECT_VIEWS.RECIPES, {
        enabledModules: [ProjectModuleKey.RECIPES],
        effectivePlan: SubscriptionPlan.FREE,
      })
    ).toBe(true);
    expect(
      getProjectViewFeatureLockState(
        PROJECT_VIEWS.RECIPES,
        SubscriptionPlan.FREE
      )
    ).toEqual({ locked: false });
  });
});
