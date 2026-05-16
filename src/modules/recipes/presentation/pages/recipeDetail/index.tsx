import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import Loader from "@/shared/design-system/loader";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import Client from "./Client";
import RecipeDetailToolbarClient from "./RecipeDetailToolbarClient";

import { getCatalogRecipeDetail } from "@/modules/recipes/core/usecases/catalog/getCatalogRecipeDetail";
import { getCatalogRecipeHeader } from "@/modules/recipes/core/usecases/catalog/getCatalogRecipeHeader";
import { createCatalogRepository } from "@/modules/recipes/infrastructure/supabase/catalog/CatalogRepository.supabase";
import { buildRecipeEditRoute } from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  recipeId: string;
};

const RecipeDetailBody = async ({ projectId, recipeId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const catalogRepository = createCatalogRepository(supabaseClient);
  const recipe = await getCatalogRecipeDetail({
    catalogRepository,
  })({
    projectId,
    recipeId,
  });

  if (!recipe) {
    return null;
  }

  return <Client projectId={projectId} recipe={recipe} />;
};

const RecipeDetailPage = async ({ projectId, recipeId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const catalogRepository = createCatalogRepository(supabaseClient);

  const recipeHeader = await getCatalogRecipeHeader({ catalogRepository })({
    projectId,
    recipeId,
  });

  if (!recipeHeader) {
    notFound();
  }

  const t = await getTranslations("pages.recipes.detail");
  const editHref = buildRecipeEditRoute(projectId, recipeHeader.id);
  const editLabel = t("editAction");
  const editAriaLabel = t("editRecipeAriaLabel", { title: recipeHeader.title });

  return (
    <>
      <RecipeDetailToolbarClient
        title={recipeHeader.title}
        editHref={editHref}
        editLabel={editLabel}
        editAriaLabel={editAriaLabel}
      />
      <Suspense fallback={<Loader variant="inline" size="medium" />}>
        <RecipeDetailBody projectId={projectId} recipeId={recipeId} />
      </Suspense>
    </>
  );
};

export default RecipeDetailPage;
