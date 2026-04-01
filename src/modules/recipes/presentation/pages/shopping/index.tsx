import Card from "@/shared/design-system/card";

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

const RecipesShoppingPage = ({ projectId }: Props) => {
  return (
    <RecipesPageScaffold
      eyebrow="Recipes / shopping"
      title="La shopping list a sa propre base de page."
      description="La preview validait une todo list tres simple. Cette route pose maintenant le cadre shopping sans lier encore les recettes, les ajouts et le done."
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
          <div className={styles["recipes-scaffold__metric"]}>
            <span className={styles["recipes-scaffold__metric-value"]}>2</span>
            <span className={styles["recipes-scaffold__metric-label"]}>
              groupes de courses exemple pour verrouiller la future lecture
              mobile.
            </span>
          </div>
        </Card>
      }
    >
      <div className={styles["recipes-scaffold__split"]}>
        <ShoppingSummaryCard href={buildRecipesQuickListRoute(projectId)} />
        <div className={styles["recipes-scaffold__stack"]}>
          <QuickListSummaryCard
            href={buildRecipesQuickListRoute(projectId)}
            variant="active"
          />
          <p className={styles["recipes-scaffold__note"]}>
            Hors scope etape 2: aggregation des ingredients, synchronisation des
            ajouts et checklist persistante.
          </p>
        </div>
      </div>
    </RecipesPageScaffold>
  );
};

export default RecipesShoppingPage;
