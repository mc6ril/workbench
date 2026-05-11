"use client";

import { type MouseEvent, useEffect, useRef } from "react";
import Image from "next/image";

import Link from "@/shared/design-system/link";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

import type { CatalogRecipeSummary } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import {
  CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS,
  type CatalogRecipeFilterCategoryKey,
  listCatalogRecipeDefaultTagSlugs,
} from "@/modules/recipes/core/domain/catalog/catalogRecipeFilters";
import { useRemoveSelection } from "@/modules/recipes/presentation/hooks/planner/useRemoveSelection";
import { useSelectRecipe } from "@/modules/recipes/presentation/hooks/planner/useSelectRecipe";
import {
  buildRecipeDetailRoute,
  buildRecipeEditRoute,
} from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  recipe: CatalogRecipeSummary;
  quickListSelectionId: string | null;
  onQuickListMutationSuccess?: (input: {
    sourceElement: HTMLButtonElement;
    delta: 1 | -1;
  }) => void;
};

const DEFAULT_TAG_SLUGS = new Set(listCatalogRecipeDefaultTagSlugs());

const cx = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const findCategoryOption = (
  tags: CatalogRecipeSummary["tags"],
  category: CatalogRecipeFilterCategoryKey,
  excludedTagSlugs?: Set<string>
) => {
  for (const tag of tags) {
    if (excludedTagSlugs?.has(tag.slug)) {
      continue;
    }

    const matchingOption = CATALOG_RECIPE_FILTER_OPTION_DEFINITIONS.find(
      (option) =>
        option.category === category && option.tagSlugs.includes(tag.slug)
    );

    if (matchingOption) {
      return {
        optionId: matchingOption.id,
        matchedTagSlug: tag.slug,
      };
    }
  }

  return null;
};

const EditRecipeIcon = () => {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={styles["recipes-page__recipe-edit-icon"]}
    >
      <path
        d="M12.3 3.5l4.2 4.2-9.8 9.8H2.5v-4.2l9.8-9.8zm1.4-1.4a2 2 0 012.8 0l1.4 1.4a2 2 0 010 2.8l-1 1-4.2-4.2 1-1z"
        fill="currentColor"
      />
    </svg>
  );
};

const QuickListToggleIcon = ({ selected }: { selected: boolean }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={styles["recipes-page__quick-list-toggle-icon"]}
    >
      <path
        d="M10 2.75l1.93 3.92 4.32.63-3.13 3.05.74 4.31L10 12.63 6.14 14.66l.74-4.31-3.13-3.05 4.32-.63L10 2.75z"
        fill={selected ? "currentColor" : "none"}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
};

const RecipeCatalogCard = ({
  projectId,
  recipe,
  quickListSelectionId,
  onQuickListMutationSuccess,
}: Props) => {
  const t = useTranslation("pages.recipes.catalog");
  const detailHref = buildRecipeDetailRoute(projectId, recipe.id);
  const editHref = buildRecipeEditRoute(projectId, recipe.id);
  const selectRecipeMutation = useSelectRecipe();
  const removeSelectionMutation = useRemoveSelection();
  const pendingQuickListFeedbackRef = useRef<{
    mutation: "select" | "remove";
    sourceElement: HTMLButtonElement;
    delta: 1 | -1;
  } | null>(null);
  const isSelecting =
    selectRecipeMutation.isPending &&
    selectRecipeMutation.variables?.recipeId === recipe.id;
  const isRemoving =
    removeSelectionMutation.isPending &&
    removeSelectionMutation.variables?.selectionId === quickListSelectionId;
  const isUpdatingQuickList = isSelecting || isRemoving;
  const popularTag = findCategoryOption(recipe.tags, "popular");
  const typeTag =
    findCategoryOption(
      recipe.tags,
      "type",
      popularTag ? new Set([popularTag.matchedTagSlug]) : undefined
    ) ?? findCategoryOption(recipe.tags, "type");
  const usedTagSlugs = new Set(
    [typeTag?.matchedTagSlug, popularTag?.matchedTagSlug].filter(
      (tagSlug): tagSlug is string => Boolean(tagSlug)
    )
  );
  const customTags = recipe.tags
    .filter(
      (tag) => !DEFAULT_TAG_SLUGS.has(tag.slug) && !usedTagSlugs.has(tag.slug)
    )
    .slice(0, 2);
  const displayTags = [
    typeTag ? t(`sheet.options.${typeTag.optionId}`) : null,
    popularTag ? t(`sheet.options.${popularTag.optionId}`) : null,
    ...customTags.map((tag) => tag.label),
  ].filter((tagLabel): tagLabel is string => Boolean(tagLabel));
  const quickListActionLabel = recipe.isInQuickList
    ? t("card.removeFromQuickListAriaLabel", { title: recipe.title })
    : t("card.addToQuickListAriaLabel", { title: recipe.title });
  const canToggleQuickList =
    !recipe.isInQuickList || Boolean(quickListSelectionId);
  const hasQuickListError =
    (selectRecipeMutation.isError &&
      selectRecipeMutation.variables?.recipeId === recipe.id) ||
    (removeSelectionMutation.isError &&
      removeSelectionMutation.variables?.selectionId === quickListSelectionId);

  useEffect(() => {
    if (
      !selectRecipeMutation.isSuccess ||
      !pendingQuickListFeedbackRef.current ||
      pendingQuickListFeedbackRef.current.mutation !== "select"
    ) {
      return;
    }

    onQuickListMutationSuccess?.({
      sourceElement: pendingQuickListFeedbackRef.current.sourceElement,
      delta: pendingQuickListFeedbackRef.current.delta,
    });
    pendingQuickListFeedbackRef.current = null;
  }, [onQuickListMutationSuccess, selectRecipeMutation.isSuccess]);

  useEffect(() => {
    if (
      !removeSelectionMutation.isSuccess ||
      !pendingQuickListFeedbackRef.current ||
      pendingQuickListFeedbackRef.current.mutation !== "remove"
    ) {
      return;
    }

    onQuickListMutationSuccess?.({
      sourceElement: pendingQuickListFeedbackRef.current.sourceElement,
      delta: pendingQuickListFeedbackRef.current.delta,
    });
    pendingQuickListFeedbackRef.current = null;
  }, [onQuickListMutationSuccess, removeSelectionMutation.isSuccess]);

  useEffect(() => {
    if (!selectRecipeMutation.isError && !removeSelectionMutation.isError) {
      return;
    }

    pendingQuickListFeedbackRef.current = null;
  }, [removeSelectionMutation.isError, selectRecipeMutation.isError]);

  const handleQuickListToggle = (event: MouseEvent<HTMLButtonElement>) => {
    const sourceElement = event.currentTarget;

    if (recipe.isInQuickList && quickListSelectionId) {
      pendingQuickListFeedbackRef.current = {
        mutation: "remove",
        sourceElement,
        delta: -1,
      };
      removeSelectionMutation.mutate({
        projectId,
        selectionId: quickListSelectionId,
      });
      return;
    }

    pendingQuickListFeedbackRef.current = {
      mutation: "select",
      sourceElement,
      delta: 1,
    };
    selectRecipeMutation.mutate({
      projectId,
      recipeId: recipe.id,
    });
  };

  return (
    <article
      className={cx(
        styles["recipes-page__recipe-card"],
        recipe.isInQuickList && styles["recipes-page__recipe-card--selected"]
      )}
    >
      <div className={styles["recipes-page__recipe-card-toggle-row"]}>
        <Link
          href={editHref}
          prefetch={false}
          unstyled
          ariaLabel={t("card.editRecipeAriaLabel", { title: recipe.title })}
          className={styles["recipes-page__recipe-edit-link"]}
          title={t("card.editRecipeAriaLabel", { title: recipe.title })}
        >
          <EditRecipeIcon />
        </Link>
        <button
          type="button"
          className={cx(
            styles["recipes-page__quick-list-toggle"],
            recipe.isInQuickList &&
              styles["recipes-page__quick-list-toggle--selected"]
          )}
          aria-busy={isUpdatingQuickList}
          aria-label={quickListActionLabel}
          aria-pressed={recipe.isInQuickList}
          disabled={!canToggleQuickList || isUpdatingQuickList}
          title={quickListActionLabel}
          onClick={handleQuickListToggle}
        >
          <QuickListToggleIcon selected={recipe.isInQuickList} />
        </button>
      </div>

      <Link
        href={detailHref}
        prefetch={false}
        unstyled
        ariaLabel={t("card.openRecipeAriaLabel", { title: recipe.title })}
        className={styles["recipes-page__recipe-card-link"]}
      >
        <div
          className={cx(
            styles["recipes-page__recipe-media"],
            styles[`recipes-page__recipe-media--${recipe.coverStyle}`]
          )}
        >
          {recipe.coverImageUrl ? (
            <>
              <Image
                src={recipe.coverImageUrl}
                alt=""
                fill
                className={styles["recipes-page__recipe-media-image"]}
                sizes="(max-width: 480px) calc(100vw - 2rem), 16rem"
              />
              <span
                aria-hidden="true"
                className={styles["recipes-page__recipe-media-overlay"]}
              />
            </>
          ) : null}
        </div>

        <div className={styles["recipes-page__recipe-card-body"]}>
          <h3 className={styles["recipes-page__recipe-title"]}>
            {recipe.title}
          </h3>

          {recipe.totalTimeLabel ? (
            <p className={styles["recipes-page__recipe-meta"]}>
              {recipe.totalTimeLabel}
            </p>
          ) : null}

          {displayTags.length > 0 ? (
            <div className={styles["recipes-page__tag-row"]}>
              {displayTags.map((tagLabel) => (
                <span key={tagLabel} className={styles["recipes-page__tag"]}>
                  {tagLabel}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>

      {hasQuickListError ? (
        <p className={styles["recipes-page__recipe-error"]}>
          {t("card.quickListUpdateFailed")}
        </p>
      ) : null}
    </article>
  );
};

export default RecipeCatalogCard;
