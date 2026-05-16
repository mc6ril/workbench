import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import styles from "./styles.module.scss";

import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { getShoppingList } from "@/modules/recipes/core/usecases/shopping/getShoppingList";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import { createShoppingRepository } from "@/modules/recipes/infrastructure/supabase/shopping/ShoppingRepository.supabase";
import QuickListSelectionsCard from "@/modules/recipes/presentation/components/quickList/QuickListSelectionsCard";
import ShoppingSummaryCard from "@/modules/recipes/presentation/components/shopping/ShoppingSummaryCard";
import { buildRecipesShoppingRoute } from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
};

const RecipesQuickListPage = async ({ projectId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const plannerRepository = createPlannerRepository(supabaseClient);
  const shoppingRepository = createShoppingRepository(supabaseClient);
  const [quickListRecipes, shoppingList] = await Promise.all([
    listActiveSelections({ plannerRepository })(projectId),
    getShoppingList({ shoppingRepository })(projectId),
  ]);

  return (
    <div className={styles["quicklist-page"]}>
      <QuickListSelectionsCard
        projectId={projectId}
        initialSelections={quickListRecipes}
      />
      <ShoppingSummaryCard
        href={buildRecipesShoppingRoute(projectId)}
        shoppingList={shoppingList}
      />
    </div>
  );
};

export default RecipesQuickListPage;
