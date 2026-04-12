import RecipeEditorPage from "@/modules/recipes/presentation/pages/editor";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

const RecipeEditPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string; recipeId: string }>;
}) => {
  const { projectId, recipeId } = await params;

  return withRecipesRouteAccess(projectId, () => {
    return (
      <RecipeEditorPage projectId={projectId} mode="edit" recipeId={recipeId} />
    );
  });
};

export default RecipeEditPageRoute;
