import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import Client from "./Client";
import Layout from "./Layout";

import { getCatalogRecipeDetail } from "@/modules/recipes/core/usecases/catalog/getCatalogRecipeDetail";
import { createCatalogRepository } from "@/modules/recipes/infrastructure/supabase/catalog/CatalogRepository.supabase";

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

  return (
    <Layout title={recipe.title}>
      <Client projectId={projectId} recipe={recipe} />
    </Layout>
  );
};

export default RecipeDetailPage;
