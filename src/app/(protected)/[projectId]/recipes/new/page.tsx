import { Suspense } from "react";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import RecipeEditorPage from "@/modules/recipes/presentation/pages/editor";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

type RecipesCreationPageDataProps = {
  projectId: string;
};

const RecipesCreationPageData = async ({
  projectId,
}: RecipesCreationPageDataProps) => {
  return withRecipesRouteAccess(projectId, () => {
    return <RecipeEditorPage projectId={projectId} mode="create" />;
  });
};

const RecipesCreationPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return (
    <Suspense fallback={<ProjectLoading />}>
      <RecipesCreationPageData projectId={projectId} />
    </Suspense>
  );
};

export default RecipesCreationPageRoute;
