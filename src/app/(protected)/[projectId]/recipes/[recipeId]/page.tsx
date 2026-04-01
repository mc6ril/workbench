import RecipeDetailPage from "@/modules/recipes/presentation/pages/recipeDetail";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

const RecipeDetailPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string; recipeId: string }>;
}) => {
  const { projectId, recipeId } = await params;

  return withRecipesRouteAccess(projectId, () => {
    return <RecipeDetailPage projectId={projectId} recipeId={recipeId} />;
  });
};

export default RecipeDetailPageRoute;
