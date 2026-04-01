import Badge from "@/shared/design-system/badge";
import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";
import {
  buildRecipeDetailRoute,
  buildRecipesQuickListRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  recipes: QuickListRecipe[];
};

const QuickListSummaryCard = ({ projectId, recipes }: Props) => {
  const isEmpty = recipes.length === 0;

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Quick list</p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            {isEmpty ? "Visible même à vide" : "Repas retenus pour la semaine"}
          </h2>
        </div>
      }
      footer={
        <Link href={buildRecipesQuickListRoute(projectId)}>
          Ouvrir la quick list
        </Link>
      }
    >
      <p className={styles["recipes-scaffold__panel-copy"]}>
        {isEmpty
          ? "La quick list garde sa place dans le parcours, même avant la première sélection."
          : "Le résumé garde les recettes actives lisibles depuis les autres écrans du module."}
      </p>

      {isEmpty ? (
        <p className={styles["recipes-scaffold__note"]}>
          Aucune recette active pour l&apos;instant.
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
                  <Link href={buildRecipeDetailRoute(projectId, recipe.recipeId)}>
                    {recipe.title}
                  </Link>
                  <Badge label="Active" variant="success" size="small" />
                </div>
                <p className={styles["recipes-scaffold__helper"]}>
                  {recipe.note ?? "Recette retenue pour un prochain repas."}
                </p>
              </div>
              <span className={styles["recipes-scaffold__summary-meta"]}>
                {recipe.servingsLabel}
              </span>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
};

export default QuickListSummaryCard;
