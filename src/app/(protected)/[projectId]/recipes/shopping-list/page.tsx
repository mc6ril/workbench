import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";
import RecipesShoppingPage from "@/modules/recipes/presentation/pages/shopping";

const RecipesShoppingPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return withRecipesRouteAccess(projectId, () => {
    return <RecipesShoppingPage projectId={projectId} />;
  });
};

export default RecipesShoppingPageRoute;
