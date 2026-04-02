"use client";

import Link from "@/shared/design-system/link";

import styles from "./styles.module.scss";

import type { CatalogRecipeSummary } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { useSelectRecipe } from "@/modules/recipes/presentation/hooks";
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
  const selectRecipeMutation = useSelectRecipe();
  const isSelecting =
    selectRecipeMutation.isPending &&
    selectRecipeMutation.variables?.recipeId === recipe.id;

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
        <p className={styles["recipes-page__recipe-summary"]}>
          {recipe.summary}
        </p>

        <div className={styles["recipes-page__tag-row"]}>
          {recipe.tags.map((tag) => (
            <span key={tag.id} className={styles["recipes-page__tag"]}>
              {tag.label}
            </span>
          ))}
        </div>

        <div className={styles["recipes-page__recipe-actions"]}>
          <Link
            href={detailHref}
            className={styles["recipes-page__action-link"]}
          >
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
              Active dans la quick list
            </Link>
          ) : (
            <button
              type="button"
              className={cx(
                styles["recipes-page__action-link"],
                styles["recipes-page__action-link--accent"],
                styles["recipes-page__action-button"]
              )}
              disabled={isSelecting}
              onClick={() => {
                selectRecipeMutation.mutate({
                  projectId,
                  recipeId: recipe.id,
                });
              }}
            >
              {isSelecting ? "Ajout en cours..." : "Ajouter à la quick list"}
            </button>
          )}
        </div>

        {selectRecipeMutation.isError &&
        selectRecipeMutation.variables?.recipeId === recipe.id ? (
          <p className={styles["recipes-page__recipe-error"]}>
            Cette recette n&apos;est pas encore sélectionnable depuis ce
            catalogue.
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default RecipeCatalogCard;
