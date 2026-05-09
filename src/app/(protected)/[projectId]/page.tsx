import { redirect } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";

import {
  hasProjectModule,
  ProjectModuleKey,
} from "@/domains/project/core/domain/projectModule.types";
import { getProjectShellSnapshot } from "@/domains/project/infrastructure/server/getProjectShellSnapshot";
import { buildProjectViewHref } from "@/domains/project/presentation/navigation/projectViews.config";

const ProjectPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  const { enabledModules, isRecipesBoardVisible } =
    await getProjectShellSnapshot(projectId);

  const hiddenViews = isRecipesBoardVisible ? [] : [PROJECT_VIEWS.RECIPES];
  const hasRecipes =
    !hiddenViews.includes(PROJECT_VIEWS.RECIPES) &&
    hasProjectModule(enabledModules, ProjectModuleKey.RECIPES);

  const defaultView = hasRecipes ? PROJECT_VIEWS.RECIPES : PROJECT_VIEWS.BOARD;
  redirect(buildProjectViewHref(projectId, defaultView));
};

export default ProjectPage;
