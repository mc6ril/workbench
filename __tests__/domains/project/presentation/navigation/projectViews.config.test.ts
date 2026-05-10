import { PROJECT_VIEWS } from "@/shared/constants/routes";

import { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import {
  canAccessProjectView,
  getDefaultProjectViewKey,
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
      getDefaultProjectViewKey({ enabledModules: [ProjectModuleKey.RECIPES] })
    ).toBe(PROJECT_VIEWS.RECIPES);
  });

  it("falls back to Board when Recipes is not enabled", () => {
    expect(getDefaultProjectViewKey({ enabledModules: [] })).toBe(
      PROJECT_VIEWS.BOARD
    );
  });

  it("reports Recipes as accessible once the module is enabled", () => {
    expect(
      canAccessProjectView(PROJECT_VIEWS.RECIPES, {
        enabledModules: [ProjectModuleKey.RECIPES],
      })
    ).toBe(true);
  });

  it("hides Recipes when the runtime visibility marks the view as hidden", () => {
    expect(
      canAccessProjectView(PROJECT_VIEWS.RECIPES, {
        enabledModules: [ProjectModuleKey.RECIPES],
        hiddenViews: [PROJECT_VIEWS.RECIPES],
      })
    ).toBe(false);

    expect(
      getDefaultProjectViewKey({
        enabledModules: [ProjectModuleKey.RECIPES],
        hiddenViews: [PROJECT_VIEWS.RECIPES],
      })
    ).toBe(PROJECT_VIEWS.BOARD);
  });
});
