import { redirect } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";

import {
  hasProjectModule,
  ProjectModuleKey,
} from "@/domains/project/core/domain/projectModule.types";
import { getProjectShellSnapshot } from "@/domains/project/infrastructure/server/getProjectShellSnapshot";
import { buildProjectViewHref } from "@/domains/project/presentation/navigation/projectViews.config";

export const withRecipesRouteAccess = async <T>(
  projectId: string,
  render: () => Promise<T> | T
): Promise<T> => {
  const { enabledModules, isRecipesBoardVisible } =
    await getProjectShellSnapshot(projectId);

  const hasAccess =
    isRecipesBoardVisible &&
    hasProjectModule(enabledModules, ProjectModuleKey.RECIPES);

  if (!hasAccess) {
    redirect(buildProjectViewHref(projectId, PROJECT_VIEWS.BOARD));
  }

  return render();
};
