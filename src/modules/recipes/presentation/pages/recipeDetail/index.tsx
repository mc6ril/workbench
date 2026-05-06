import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client";

import Client from "./Client";
import Layout from "./Layout";

import { getCatalogRecipeDetail } from "@/modules/recipes/core/usecases/catalog/getCatalogRecipeDetail";
import { createCatalogRepository } from "@/modules/recipes/infrastructure/supabase/catalog/CatalogRepository.supabase";
import { buildRecipeEditRoute } from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  recipeId: string;
};

const RecipeDetailPage = async ({ projectId, recipeId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const catalogRepository = createCatalogRepository(supabaseClient);
  const recipe = await getCatalogRecipeDetail({
    catalogRepository,
  })({
    projectId,
    recipeId,
  });

  if (!recipe) {
    notFound();
  }

  const t = await getTranslations("pages.recipes.detail");

  return (
    <Layout
      title={recipe.title}
      editHref={buildRecipeEditRoute(projectId, recipe.id)}
      editLabel={t("editAction")}
      editAriaLabel={t("editRecipeAriaLabel", { title: recipe.title })}
    >
      <Client projectId={projectId} recipe={recipe} />
    </Layout>
  );
};

export default RecipeDetailPage;
