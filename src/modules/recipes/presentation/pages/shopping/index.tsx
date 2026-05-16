import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import styles from "./styles.module.scss";

import { getShoppingList } from "@/modules/recipes/core/usecases/shopping/getShoppingList";
import { createShoppingRepository } from "@/modules/recipes/infrastructure/supabase/shopping/ShoppingRepository.supabase";
import ShoppingListClientCard from "@/modules/recipes/presentation/components/shopping/ShoppingListClientCard";

type Props = {
  projectId: string;
};

const RecipesShoppingPage = async ({ projectId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const shoppingRepository = createShoppingRepository(supabaseClient);
  const shoppingList = await getShoppingList({ shoppingRepository })(projectId);

  return (
    <div className={styles["shopping-page"]}>
      <ShoppingListClientCard
        projectId={projectId}
        initialShoppingList={shoppingList}
      />
    </div>
  );
};

export default RecipesShoppingPage;
