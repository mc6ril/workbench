import { notFound } from "next/navigation";

import Card from "@/shared/design-system/card";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import styles from "./styles.module.scss";

import { getCatalogRecipeDetail } from "@/modules/recipes/core/usecases/catalog/getCatalogRecipeDetail";
import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { createCatalogRepository } from "@/modules/recipes/infrastructure/supabase/catalog/CatalogRepository.supabase";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import RecipeDetailSummaryCard from "@/modules/recipes/presentation/components/catalog/RecipeDetailSummaryCard/index";
import QuickListSummaryCard from "@/modules/recipes/presentation/components/quickList/QuickListSummaryCard";
import RecipesPageScaffold from "@/modules/recipes/presentation/pages/shared/RecipesPageScaffold";
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

  const additionCount = recipe.ingredients.filter(
    (ingredient) => ingredient.kind === "addition_candidate"
  ).length;

  return (
    <RecipesPageScaffold
      eyebrow="Recipes / detail"
      title={recipe.title}
      description="La fiche detail porte maintenant le retour de preparation: ingredients valides, ajouts a tester et decision explicite de validation restent regroupes sur un seul ecran."
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
          <div className={styles["recipes-scaffold__stack"]}>
            <div className={styles["recipes-scaffold__metric"]}>
              <span className={styles["recipes-scaffold__metric-value"]}>
                {additionCount}
              </span>
              <span className={styles["recipes-scaffold__metric-label"]}>
                ajout{additionCount > 1 ? "s" : ""} a arbitrer depuis la fiche.
              </span>
            </div>
            <p className={styles["recipes-scaffold__helper"]}>
              La validation d&apos;un ajout le fait passer en ingredient valide
              et garde la shopping list persistée coherente.
            </p>
          </div>
        </Card>
      }
    >
      <div className={styles["recipes-scaffold__split"]}>
        <RecipeDetailSummaryCard
          projectId={projectId}
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
