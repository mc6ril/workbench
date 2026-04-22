import { Suspense } from "react";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import RecipeEditorPage from "@/modules/recipes/presentation/pages/editor";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

type RecipeEditPageDataProps = {
  projectId: string;
  recipeId: string;
};

const RecipeEditPageData = async ({
  projectId,
  recipeId,
}: RecipeEditPageDataProps) => {
  return withRecipesRouteAccess(projectId, () => {
    return (
      <RecipeEditorPage projectId={projectId} mode="edit" recipeId={recipeId} />
    );
  });
};

const RecipeEditPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string; recipeId: string }>;
}) => {
  const { projectId, recipeId } = await params;

  return (
    <Suspense fallback={<ProjectLoading />}>
      <RecipeEditPageData projectId={projectId} recipeId={recipeId} />
    </Suspense>
  );
};

export default RecipeEditPageRoute;
