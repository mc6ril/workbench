import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import styles from "./styles.module.scss";

import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { generateShoppingList } from "@/modules/recipes/core/usecases/shopping/generateShoppingList";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import { createShoppingRepository } from "@/modules/recipes/infrastructure/supabase/shopping/ShoppingRepository.supabase";
import QuickListSummaryCard from "@/modules/recipes/presentation/components/quickList/QuickListSummaryCard";
import ShoppingListClientCard from "@/modules/recipes/presentation/components/shopping/ShoppingListClientCard";

type Props = {
  projectId: string;
};

const RecipesShoppingPage = async ({ projectId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const plannerRepository = createPlannerRepository(supabaseClient);
  const shoppingRepository = createShoppingRepository(supabaseClient);
  const [quickListRecipes, shoppingList] = await Promise.all([
    listActiveSelections({ plannerRepository })(projectId),
    generateShoppingList({ shoppingRepository })(projectId),
  ]);

  return (
    <div className={styles["shopping-page"]}>
      <ShoppingListClientCard
        projectId={projectId}
        initialShoppingList={shoppingList}
      />
      <QuickListSummaryCard projectId={projectId} recipes={quickListRecipes} />
    </div>
  );
};

export default RecipesShoppingPage;
