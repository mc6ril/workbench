import RecipesQuickListPage from "@/modules/recipes/presentation/pages/quickList";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

const RecipesQuickListPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return withRecipesRouteAccess(projectId, () => {
    return <RecipesQuickListPage projectId={projectId} />;
  });
};

export default RecipesQuickListPageRoute;
