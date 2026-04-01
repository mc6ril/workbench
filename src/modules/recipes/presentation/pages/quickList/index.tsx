import Card from "@/shared/design-system/card";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { listQuickListRecipes } from "@/modules/recipes/core/usecases/planner/listQuickListRecipes";
import { getShoppingList } from "@/modules/recipes/core/usecases/shopping/getShoppingList";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import { createShoppingRepository } from "@/modules/recipes/infrastructure/supabase/shopping/ShoppingRepository.supabase";
import QuickListSummaryCard from "@/modules/recipes/presentation/components/quickList/QuickListSummaryCard";
import ShoppingSummaryCard from "@/modules/recipes/presentation/components/shopping/ShoppingSummaryCard";
import RecipesPageScaffold from "@/modules/recipes/presentation/pages/shared/RecipesPageScaffold";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";
import {
  buildRecipesCatalogRoute,
  buildRecipesShoppingRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
};

const RecipesQuickListPage = async ({ projectId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const plannerRepository = createPlannerRepository(supabaseClient);
  const shoppingRepository = createShoppingRepository(supabaseClient);
  const quickListRecipes = await listQuickListRecipes({
    plannerRepository,
  })(projectId);
  const shoppingList = await getShoppingList({
    shoppingRepository,
  })(projectId);

  return (
    <RecipesPageScaffold
      eyebrow="Recipes / quick list"
      title="La quick list a maintenant sa route dediee."
      description="On garde l'intention preview: une liste courte, tres lisible, et deja branchee dans la navigation projet, sans embarquer encore le vrai planner."
      actions={[
        {
          href: buildRecipesCatalogRoute(projectId),
          label: "Retour au catalogue",
        },
        {
          href: buildRecipesShoppingRoute(projectId),
          label: "Voir la shopping list",
        },
      ]}
      aside={
        <Card variant="outlined">
          <div className={styles["recipes-scaffold__metric"]}>
            <span className={styles["recipes-scaffold__metric-value"]}>
              {quickListRecipes.length}
            </span>
            <span className={styles["recipes-scaffold__metric-label"]}>
              recette{quickListRecipes.length > 1 ? "s" : ""} actuellement dans
              la quick list projet.
            </span>
          </div>
        </Card>
      }
    >
      <div className={styles["recipes-scaffold__grid"]}>
        <QuickListSummaryCard
          href={buildRecipesCatalogRoute(projectId)}
          recipes={quickListRecipes}
        />
        <ShoppingSummaryCard
          href={buildRecipesShoppingRoute(projectId)}
          shoppingList={shoppingList}
        />
      </div>

      <p className={styles["recipes-scaffold__note"]}>
        Hors scope etape 2: selection depuis le catalogue, reorder, done et
        persistance planner.
      </p>
    </RecipesPageScaffold>
  );
};

export default RecipesQuickListPage;
