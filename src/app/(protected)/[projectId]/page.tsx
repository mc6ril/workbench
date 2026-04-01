import { redirect } from "next/navigation";

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
  const { project, effectivePlan } = await getProjectRouteViewState(projectId);
  const defaultViewKey = getDefaultProjectViewKey({
    enabledModules: project.enabledModules,
    effectivePlan,
  });

  redirect(buildProjectViewHref(projectId, defaultViewKey));
};

export default ProjectPage;
