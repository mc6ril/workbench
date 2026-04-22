import { Suspense } from "react";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import RecipeDetailPage from "@/modules/recipes/presentation/pages/recipeDetail";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

type RecipeDetailPageDataProps = {
  projectId: string;
  recipeId: string;
};

const RecipeDetailPageData = async ({
  projectId,
  recipeId,
}: RecipeDetailPageDataProps) => {
  return withRecipesRouteAccess(projectId, () => {
    return <RecipeDetailPage projectId={projectId} recipeId={recipeId} />;
  });
};

const RecipeDetailPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string; recipeId: string }>;
}) => {
  const { projectId, recipeId } = await params;

  return (
    <Suspense fallback={<ProjectLoading />}>
      <RecipeDetailPageData projectId={projectId} recipeId={recipeId} />
    </Suspense>
  );
};

export default RecipeDetailPageRoute;
