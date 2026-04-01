import { redirect } from "next/navigation";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { buildProjectRoute } from "@/shared/utils/routes";

import { hasProjectModule, ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import { getProjectForRoute } from "@/domains/project/infrastructure/server/getProjectForRoute";
import RecipesPage from "@/modules/recipes/presentation/pages/recipes";

const RecipesPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  const project = await getProjectForRoute(projectId);

  if (!hasProjectModule(project.enabledModules, ProjectModuleKey.RECIPES)) {
    redirect(buildProjectRoute(projectId, PROJECT_VIEWS.BOARD));
  }

  return <RecipesPage projectId={projectId} />;
};

export default RecipesPageRoute;
