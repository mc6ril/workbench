import { Suspense } from "react";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import RecipesQuickListPage from "@/modules/recipes/presentation/pages/quickList";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

type RecipesQuickListPageDataProps = {
  projectId: string;
};

const RecipesQuickListPageData = async ({
  projectId,
}: RecipesQuickListPageDataProps) => {
  return withRecipesRouteAccess(projectId, () => {
    return <RecipesQuickListPage projectId={projectId} />;
  });
};

const RecipesQuickListPageRoute = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return (
    <Suspense fallback={<ProjectLoading />}>
      <RecipesQuickListPageData projectId={projectId} />
    </Suspense>
  );
};

export default RecipesQuickListPageRoute;
