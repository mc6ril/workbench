import { redirect } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { buildProjectRoute } from "@/shared/utils/routes";

import {
  hasProjectModule,
  ProjectModuleKey,
} from "@/domains/project/core/domain/projectModule.types";
import { getProjectForRoute } from "@/domains/project/infrastructure/server/getProjectForRoute";

export const withRecipesRouteAccess = async <T>(
  projectId: string,
  render: () => Promise<T> | T
): Promise<T> => {
  const project = await getProjectForRoute(projectId);

  if (!hasProjectModule(project.enabledModules, ProjectModuleKey.RECIPES)) {
    redirect(buildProjectRoute(projectId, PROJECT_VIEWS.BOARD));
  }

  return render();
};
