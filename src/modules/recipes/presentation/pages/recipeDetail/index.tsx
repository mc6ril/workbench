import { notFound } from "next/navigation";

import Card from "@/shared/design-system/card";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { getCatalogRecipeDetail } from "@/modules/recipes/core/usecases/catalog/getCatalogRecipeDetail";
import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { createCatalogRepository } from "@/modules/recipes/infrastructure/supabase/catalog/CatalogRepository.supabase";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import RecipeDetailSummaryCard from "@/modules/recipes/presentation/components/catalog/RecipeDetailSummaryCard";
import QuickListSummaryCard from "@/modules/recipes/presentation/components/quickList/QuickListSummaryCard";
import RecipesPageScaffold from "@/modules/recipes/presentation/pages/shared/RecipesPageScaffold";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";
import {
  buildRecipeEditRoute,
  buildRecipesCatalogRoute,
  buildRecipesShoppingRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  recipeId: string;
};

const RecipeDetailPage = async ({ projectId, recipeId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const catalogRepository = createCatalogRepository(supabaseClient);
  const plannerRepository = createPlannerRepository(supabaseClient);
  const recipe = await getCatalogRecipeDetail({
    catalogRepository,
  })({
    projectId,
    recipeId,
  });
  const quickListRecipes = await listActiveSelections({
    plannerRepository,
  })(projectId);

  if (!recipe) {
    notFound();
  }

  return (
    <RecipesPageScaffold
      eyebrow="Recipes / detail"
      title={recipe.title}
      description="Cette page reprend l'intention detail de la preview avec une lecture calme et de gros blocs, tout en restant strictement route-level pour cette etape."
      actions={[
        {
          href: buildRecipeEditRoute(projectId, recipeId),
          label: "Passer en edition",
        },
        {
          href: buildRecipesShoppingRoute(projectId),
          label: "Voir les courses",
        },
        {
          href: buildRecipesCatalogRoute(projectId),
          label: "Retour au catalogue",
        },
      ]}
      aside={
        <Card variant="outlined">
          <div className={styles["recipes-scaffold__metric"]}>
            <span className={styles["recipes-scaffold__metric-value"]}>2</span>
            <span className={styles["recipes-scaffold__metric-label"]}>
              colonnes maximum pour garder la lecture detail tres simple.
            </span>
          </div>
        </Card>
      }
    >
      <div className={styles["recipes-scaffold__split"]}>
        <RecipeDetailSummaryCard
          recipe={recipe}
          editHref={buildRecipeEditRoute(projectId, recipeId)}
          shoppingHref={buildRecipesShoppingRoute(projectId)}
        />
        <QuickListSummaryCard
          projectId={projectId}
          recipes={quickListRecipes}
        />
      </div>
    </RecipesPageScaffold>
  );
};

export default RecipeDetailPage;
