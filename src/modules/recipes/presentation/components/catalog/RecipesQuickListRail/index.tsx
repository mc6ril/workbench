"use client";

import { useRef } from "react";

import CloseButton from "@/shared/design-system/close_button";
import Link from "@/shared/design-system/link";
import { useModalAccessibility } from "@/shared/design-system/modal/use_modal_accessibility";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

import type { QuickListRecipe } from "@/modules/recipes/core/domain/planner/quickList.types";
import { buildRecipeDetailRoute } from "@/modules/recipes/presentation/routes";

type Props = {
  isOpen: boolean;
  projectId: string;
  recipes: QuickListRecipe[];
  onClose: () => void;
  onRecipeNavigate?: (recipeId: string) => void;
};

const RecipesQuickListRail = ({
  isOpen,
  projectId,
  recipes,
  onClose,
  onRecipeNavigate,
}: Props) => {
  const t = useTranslation("pages.recipes.catalog");
  const drawerRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({ isOpen, modalRef: drawerRef, onClose });

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles["recipes-page__quick-list-backdrop"]}
      onClick={onClose}
      role="presentation"
    >
      <aside
        ref={drawerRef}
        className={styles["recipes-page__quick-list-drawer"]}
        aria-label={t("toolbar.quickList")}
        aria-modal="true"
        role="dialog"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className={styles["recipes-page__quick-list"]}>
          <div className={styles["recipes-page__quick-list-head"]}>
            <Title
              variant="h2"
              className={styles["recipes-page__quick-list-title"]}
            >
              {t("toolbar.quickList")}
            </Title>
            <CloseButton
              ariaLabel={t("toolbar.quickListHideAriaLabel")}
              onClick={onClose}
            />
          </div>

          <div className={styles["recipes-page__quick-list-items"]}>
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={buildRecipeDetailRoute(projectId, recipe.recipeId)}
                prefetch={false}
                className={styles["recipes-page__quick-list-card"]}
                onClick={() => {
                  onRecipeNavigate?.(recipe.recipeId);
                }}
              >
                <Text
                  as="span"
                  className={styles["recipes-page__quick-list-card-title"]}
                >
                  {recipe.title}
                </Text>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default RecipesQuickListRail;
