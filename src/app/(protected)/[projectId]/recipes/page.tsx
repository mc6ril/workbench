import { Suspense } from "react";

import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import RecipesPage from "@/modules/recipes/presentation/pages/recipes";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

type RecipesPageDataProps = {
  projectId: string;
  searchParams: Record<string, string | string[] | undefined>;
};

const RecipesPageData = async ({ projectId, searchParams }: RecipesPageDataProps) => {
  return withRecipesRouteAccess(projectId, () => {
    return <RecipesPage projectId={projectId} searchParams={searchParams} />;
  });
};

const RecipesPageRoute = async ({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<ProjectLoading />}>
      <RecipesPageData projectId={projectId} searchParams={resolvedSearchParams} />
    </Suspense>
  );
};

export default RecipesPageRoute;
