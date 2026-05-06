import Card from "@/shared/design-system/card";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import styles from "./styles.module.scss";

import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { generateShoppingList } from "@/modules/recipes/core/usecases/shopping/generateShoppingList";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import { createShoppingRepository } from "@/modules/recipes/infrastructure/supabase/shopping/ShoppingRepository.supabase";
import QuickListSelectionsCard from "@/modules/recipes/presentation/components/quickList/QuickListSelectionsCard";
import ShoppingSummaryCard from "@/modules/recipes/presentation/components/shopping/ShoppingSummaryCard";
import RecipesPageScaffold from "@/modules/recipes/presentation/pages/shared/RecipesPageScaffold";
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
  const quickListRecipes = await listActiveSelections({
    plannerRepository,
  })(projectId);
  const shoppingList = await generateShoppingList({
    shoppingRepository,
  })(projectId);

  return (
    <RecipesPageScaffold
      eyebrow="Recipes / quick list"
      title="Quick list des repas retenus"
      description="La route reprend l’intention preview: une liste courte, actionnable, reliée au vrai schéma recipe_selections, avec retrait simple via done ou suppression de sélection."
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
              recette{quickListRecipes.length > 1 ? "s" : ""} active
              {quickListRecipes.length > 1 ? "s" : ""} dans la quick list.
            </span>
          </div>
        </Card>
      }
    >
      <div className={styles["recipes-scaffold__grid"]}>
        <QuickListSelectionsCard
          projectId={projectId}
          initialSelections={quickListRecipes}
        />
        <ShoppingSummaryCard
          href={buildRecipesShoppingRoute(projectId)}
          shoppingList={shoppingList}
        />
      </div>
    </RecipesPageScaffold>
  );
};

export default RecipesQuickListPage;
