import { redirect } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";

import { getProjectRouteViewState } from "@/domains/project/infrastructure/server/getProjectRouteViewState";
import {
  buildProjectViewHref,
  canAccessProjectView,
  getDefaultProjectViewKey,
} from "@/domains/project/presentation/navigation/projectViews.config";

export const withRecipesRouteAccess = async <T>(
  projectId: string,
  render: () => Promise<T> | T
): Promise<T> => {
  const { project, effectivePlan, isRecipesBoardVisible } =
    await getProjectRouteViewState(projectId);
  const viewState = {
    enabledModules: project.enabledModules,
    effectivePlan,
    hiddenViews: isRecipesBoardVisible ? [] : [PROJECT_VIEWS.RECIPES],
  };

  if (!canAccessProjectView(PROJECT_VIEWS.RECIPES, viewState)) {
    redirect(
      buildProjectViewHref(projectId, getDefaultProjectViewKey(viewState))
    );
  }

  return render();
};
