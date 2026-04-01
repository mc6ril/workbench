import Card from "@/shared/design-system/card";

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

const formatRecipeLabel = (recipeId: string) => {
  const normalized = decodeURIComponent(recipeId).replace(/[-_]+/g, " ").trim();
  if (!normalized) {
    return "Recette";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const RecipeDetailPage = ({ projectId, recipeId }: Props) => {
  const recipeTitle = formatRecipeLabel(recipeId);

  return (
    <RecipesPageScaffold
      eyebrow="Recipes / detail"
      title={recipeTitle}
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
          title={recipeTitle}
          editHref={buildRecipeEditRoute(projectId, recipeId)}
          shoppingHref={buildRecipesShoppingRoute(projectId)}
        />
        <QuickListSummaryCard
          href={buildRecipesShoppingRoute(projectId)}
          variant="active"
        />
      </div>

      <p className={styles["recipes-scaffold__note"]}>
        Hors scope etape 2: vraie fiche recette, navigation precedent/suivant et
        interactions done pendant la cuisine.
      </p>
    </RecipesPageScaffold>
  );
};

export default RecipeDetailPage;
