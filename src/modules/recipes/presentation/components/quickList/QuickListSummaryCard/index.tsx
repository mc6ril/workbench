import Badge from "@/shared/design-system/badge";
import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "./styles.module.scss";

import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import {
  buildRecipeDetailRoute,
  buildRecipesQuickListRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  recipes: QuickListRecipe[];
};

const statusBadge = (status: QuickListRecipe["status"]) => {
  if (status === "shopping_done") {
    return <Badge label="Prêt" variant="info" size="small" />;
  }
  return <Badge label="À cuisiner" variant="success" size="small" />;
};

const QuickListSummaryCard = ({ projectId, recipes }: Props) => {
  const isEmpty = recipes.length === 0;

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Nos repas</p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            {isEmpty
              ? "Aucun repas cette semaine"
              : `${recipes.length} repas`}
          </h2>
        </div>
      }
      footer={
        <Link href={buildRecipesQuickListRoute(projectId)}>Voir nos repas</Link>
      }
    >
      {isEmpty ? (
        <p className={styles["recipes-scaffold__helper"]}>
          Sélectionnez des recettes depuis le catalogue pour commencer.
        </p>
      ) : (
        <div className={styles["recipes-scaffold__summary-list"]}>
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className={styles["recipes-scaffold__summary-item"]}
            >
              <div className={styles["recipes-scaffold__summary-copy"]}>
                <div className={styles["recipes-scaffold__summary-head"]}>
                  <Link
                    href={buildRecipeDetailRoute(projectId, recipe.recipeId)}
                    prefetch={false}
                  >
                    {recipe.title}
                  </Link>
                  {statusBadge(recipe.status)}
                </div>
                <p className={styles["recipes-scaffold__helper"]}>
                  {recipe.servingsLabel}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
};

export default QuickListSummaryCard;
