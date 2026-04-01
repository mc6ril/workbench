import Card from "@/shared/design-system/card";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { getShoppingList } from "@/modules/recipes/core/usecases/shopping/getShoppingList";
import { createShoppingRepository } from "@/modules/recipes/infrastructure/supabase/shopping/ShoppingRepository.supabase";
import QuickListSummaryCard from "@/modules/recipes/presentation/components/quickList/QuickListSummaryCard";
import ShoppingSummaryCard from "@/modules/recipes/presentation/components/shopping/ShoppingSummaryCard";
import RecipesPageScaffold from "@/modules/recipes/presentation/pages/shared/RecipesPageScaffold";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";
import {
  buildRecipesCatalogRoute,
  buildRecipesQuickListRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
};

const RecipesShoppingPage = async ({ projectId }: Props) => {
  const supabaseClient = await createSupabaseServerClient();
  const shoppingRepository = createShoppingRepository(supabaseClient);
  const shoppingList = await getShoppingList({
    shoppingRepository,
  })(projectId);

  return (
    <RecipesPageScaffold
      eyebrow="Recipes / shopping"
      title="La shopping list passe sur une generation metier simple."
      description="La sortie courses reprend la maquette validee: groupes lisibles, ajouts visibles et regles de fusion tres prudentes pour ne pas inventer de sens."
      actions={[
        {
          href: buildRecipesQuickListRoute(projectId),
          label: "Retour a la quick list",
        },
        {
          href: buildRecipesCatalogRoute(projectId),
          label: "Retour au catalogue",
        },
      ]}
      aside={
        <Card variant="outlined">
          <div className={styles["recipes-scaffold__stack"]}>
            <div className={styles["recipes-scaffold__panel-head"]}>
              <p className={styles["recipes-scaffold__panel-kicker"]}>
                Generation v1
              </p>
              <h2 className={styles["recipes-scaffold__panel-title"]}>
                Fusion seulement quand c&apos;est sur
              </h2>
            </div>
            <ul className={styles["recipes-scaffold__list"]}>
              <li>Nom visible et nom normalise sont gardes separes.</li>
              <li>Les quantites libres restent affichees via `amountText`.</li>
              <li>Les ajouts a tester restent identifies jusqu&apos;aux courses.</li>
            </ul>
          </div>
        </Card>
      }
    >
      <div className={styles["recipes-scaffold__split"]}>
        <ShoppingSummaryCard
          href={buildRecipesQuickListRoute(projectId)}
          shoppingList={shoppingList}
          ctaLabel="Retour a la quick list"
        />
        <div className={styles["recipes-scaffold__stack"]}>
          <QuickListSummaryCard
            href={buildRecipesQuickListRoute(projectId)}
            variant="active"
          />
          <Card variant="outlined">
            <div className={styles["recipes-scaffold__stack"]}>
              <div className={styles["recipes-scaffold__panel-head"]}>
                <p className={styles["recipes-scaffold__panel-kicker"]}>
                  Garde-fou produit
                </p>
                <h2 className={styles["recipes-scaffold__panel-title"]}>
                  Pas de fusion des ingredients ambigus
                </h2>
              </div>
              <p className={styles["recipes-scaffold__panel-copy"]}>
                Une quantite comme `au gout` reste une ligne autonome. On
                prefere une duplication legere a une liste de courses fausse.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <p className={styles["recipes-scaffold__note"]}>
        Hors scope etape 4: checklist persistante, regroupement par foyer,
        vrai planner connecte et arbitrage done.
      </p>
    </RecipesPageScaffold>
  );
};

export default RecipesShoppingPage;
