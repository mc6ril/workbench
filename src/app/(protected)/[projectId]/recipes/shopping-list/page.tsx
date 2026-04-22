import { Suspense } from "react";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";
import RecipesShoppingPage from "@/modules/recipes/presentation/pages/shopping";

type RecipesShoppingPageDataProps = {
  projectId: string;
};

const RecipesShoppingPageData = async ({
  projectId,
}: RecipesShoppingPageDataProps) => {
  return withRecipesRouteAccess(projectId, () => {
    return <RecipesShoppingPage projectId={projectId} />;
  });
};

const RecipesShoppingPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return (
    <Suspense fallback={<ProjectLoading />}>
      <RecipesShoppingPageData projectId={projectId} />
    </Suspense>
  );
};

export default RecipesShoppingPageRoute;
