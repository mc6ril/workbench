import RecipesPage from "@/modules/recipes/presentation/pages/recipes";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

const RecipesPageRoute = async ({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;

  return withRecipesRouteAccess(projectId, () => {
    return (
      <RecipesPage projectId={projectId} searchParams={resolvedSearchParams} />
    );
  });
};

export default RecipesPageRoute;
