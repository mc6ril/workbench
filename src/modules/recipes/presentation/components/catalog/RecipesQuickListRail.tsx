import Badge from "@/shared/design-system/badge";
import Link from "@/shared/design-system/link";

import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import styles from "@/modules/recipes/presentation/pages/recipes/styles.module.scss";
import {
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
          : "Le rail garde assez de contexte pour arbitrer la semaine sans quitter le catalogue."}
      </p>

      {isEmpty ? (
        <div className={styles["recipes-page__quick-list-empty"]}>
          <p>
            Aucune recette retenue pour l&apos;instant. Les recettes déjà
            sélectionnées dans le projet remonteront ici sans changer la
            hiérarchie de la page.
          </p>
        </div>
      ) : (
        <div className={styles["recipes-page__quick-list-items"]}>
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className={styles["recipes-page__quick-list-item"]}
            >
              <div>
                <h3 className={styles["recipes-page__quick-list-item-title"]}>
                  {recipe.title}
                </h3>
                <p className={styles["recipes-page__quick-list-item-note"]}>
                  {recipe.note ?? "Prête à retrouver ses courses et son détail."}
                </p>
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
