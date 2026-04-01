import Badge from "@/shared/design-system/badge";
import Link from "@/shared/design-system/link";

import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import styles from "@/modules/recipes/presentation/pages/recipes/styles.module.scss";
import {
  buildRecipeDetailRoute,
  buildRecipesQuickListRoute,
  buildRecipesShoppingRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  recipes: QuickListRecipe[];
};

const RecipesQuickListRail = ({ projectId, recipes }: Props) => {
  const isEmpty = recipes.length === 0;

  return (
    <aside className={styles["recipes-page__quick-list"]}>
      <div className={styles["recipes-page__quick-list-head"]}>
        <div>
          <p className={styles["recipes-page__panel-kicker"]}>Quick list</p>
          <h2 className={styles["recipes-page__panel-title"]}>
            {isEmpty
              ? "Semaine encore ouverte"
              : `${recipes.length} repas retenu${recipes.length > 1 ? "s" : ""}`}
          </h2>
        </div>
        <Badge
          label={`${recipes.length} sélection${recipes.length > 1 ? "s" : ""}`}
          variant={isEmpty ? "default" : "success"}
          size="small"
        />
      </div>

      <p className={styles["recipes-page__quick-list-helper"]}>
        {isEmpty
          ? "Visible mais discrète, la quick list garde sa place dans le catalogue pour qu’on sache toujours où la semaine en est."
          : "Le rail donne assez d’info pour arbitrer, ouvrir une fiche ou finir un repas sans remaquetter le catalogue."}
      </p>

      {isEmpty ? (
        <div className={styles["recipes-page__quick-list-empty"]}>
          <p>
            Choisissez une vraie recette persistée pour préparer la semaine. La
            quick list reste visible même quand rien n&apos;est encore retenu.
          </p>
        </div>
      ) : (
        <div className={styles["recipes-page__quick-list-items"]}>
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className={styles["recipes-page__quick-list-item"]}
            >
              <div className={styles["recipes-page__quick-list-item-main"]}>
                <div className={styles["recipes-page__quick-list-item-head"]}>
                  <h3 className={styles["recipes-page__quick-list-item-title"]}>
                    {recipe.title}
                  </h3>
                  <Badge label="Active" variant="success" size="small" />
                </div>
                <p className={styles["recipes-page__quick-list-item-note"]}>
                  {recipe.note ?? "Recette retenue pour un prochain repas."}
                </p>
                <div className={styles["recipes-page__quick-list-item-links"]}>
                  <Link
                    href={buildRecipeDetailRoute(projectId, recipe.recipeId)}
                    className={styles["recipes-page__action-link"]}
                  >
                    Voir la fiche
                  </Link>
                </div>
              </div>
              <span className={styles["recipes-page__quick-list-serving"]}>
                {recipe.servingsLabel}
              </span>
            </article>
          ))}
        </div>
      )}

      <div className={styles["recipes-page__quick-list-footer"]}>
        <Link
          href={buildRecipesQuickListRoute(projectId)}
          className={styles["recipes-page__primary-cta"]}
        >
          Ouvrir la quick list
        </Link>
        <Link
          href={buildRecipesShoppingRoute(projectId)}
          className={styles["recipes-page__secondary-link"]}
        >
          Voir les courses
        </Link>
      </div>
    </aside>
  );
};

export default RecipesQuickListRail;
