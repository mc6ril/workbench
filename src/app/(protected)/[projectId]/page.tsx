import { redirect } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";

import { getProjectRouteViewState } from "@/domains/project/infrastructure/server/getProjectRouteViewState";
import {
  buildProjectViewHref,
  getDefaultProjectViewKey,
} from "@/domains/project/presentation/navigation/projectViews.config";

/**
 * Project root page.
 * This route redirects to the first accessible project view.
 */
const ProjectPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  const { project, effectivePlan, isRecipesBoardVisible } =
    await getProjectRouteViewState(projectId);
  const defaultViewKey = getDefaultProjectViewKey({
    enabledModules: project.enabledModules,
    effectivePlan,
    hiddenViews: isRecipesBoardVisible ? [] : [PROJECT_VIEWS.RECIPES],
  });

  redirect(buildProjectViewHref(projectId, defaultViewKey));
};

export default ProjectPage;
