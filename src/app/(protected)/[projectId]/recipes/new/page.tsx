import RecipeEditorPage from "@/modules/recipes/presentation/pages/editor";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

const RecipesCreationPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return withRecipesRouteAccess(projectId, () => {
    return <RecipeEditorPage projectId={projectId} mode="create" />;
  });
};

export default RecipesCreationPageRoute;
