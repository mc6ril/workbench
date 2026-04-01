import Card from "@/shared/design-system/card";

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

const RecipesQuickListPage = ({ projectId }: Props) => {
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
            <span className={styles["recipes-scaffold__metric-value"]}>3</span>
            <span className={styles["recipes-scaffold__metric-label"]}>
              recettes exemple visibles pour fixer la structure de la page.
            </span>
          </div>
        </Card>
      }
    >
      <div className={styles["recipes-scaffold__grid"]}>
        <QuickListSummaryCard
          href={buildRecipesCatalogRoute(projectId)}
          variant="active"
        />
        <ShoppingSummaryCard href={buildRecipesShoppingRoute(projectId)} />
      </div>

      <p className={styles["recipes-scaffold__note"]}>
        Hors scope etape 2: selection depuis le catalogue, reorder, done et
        persistance planner.
      </p>
    </RecipesPageScaffold>
  );
};

export default RecipesQuickListPage;
