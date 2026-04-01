import Link from "@/shared/design-system/link";

import type { CatalogRecipeSummary } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import styles from "@/modules/recipes/presentation/pages/recipes/styles.module.scss";
import {
  buildRecipeDetailRoute,
  buildRecipesQuickListRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  recipe: CatalogRecipeSummary;
};

const cx = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const RecipeCatalogCard = ({ projectId, recipe }: Props) => {
  const detailHref = buildRecipeDetailRoute(projectId, recipe.id);
  const quickListHref = buildRecipesQuickListRoute(projectId);

  return (
    <article
      className={cx(
        styles["recipes-page__recipe-card"],
        recipe.isInQuickList && styles["recipes-page__recipe-card--selected"]
      )}
    >
      <div
        className={cx(
          styles["recipes-page__recipe-media"],
          styles[`recipes-page__recipe-media--${recipe.coverStyle}`]
        )}
      >
        <span className={styles["recipes-page__recipe-media-chip"]}>
          {recipe.isInQuickList ? "Déjà retenue" : "Catalogue"}
        </span>
        <span className={styles["recipes-page__recipe-media-title"]}>
          {recipe.title}
        </span>
      </div>

      <div className={styles["recipes-page__recipe-card-body"]}>
        <div className={styles["recipes-page__recipe-meta"]}>
          <span>{recipe.totalTimeLabel}</span>
          <span>{recipe.servingsLabel}</span>
        </div>

        <h3 className={styles["recipes-page__recipe-title"]}>{recipe.title}</h3>
        <p className={styles["recipes-page__recipe-summary"]}>{recipe.summary}</p>

        <div className={styles["recipes-page__tag-row"]}>
          {recipe.tags.map((tag) => (
            <span key={tag.id} className={styles["recipes-page__tag"]}>
              {tag.label}
            </span>
          ))}
        </div>

        <div className={styles["recipes-page__recipe-actions"]}>
          <Link href={detailHref} className={styles["recipes-page__action-link"]}>
            Voir la fiche
          </Link>

          {recipe.isInQuickList ? (
            <Link
              href={quickListHref}
              className={cx(
                styles["recipes-page__action-link"],
                styles["recipes-page__action-link--accent"]
              )}
            >
              Dans la quick list
            </Link>
          ) : (
            <span className={styles["recipes-page__recipe-status"]}>
              Sélection catalogue branchée à l&apos;étape suivante
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default RecipeCatalogCard;
