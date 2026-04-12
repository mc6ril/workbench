"use client";

import { useEffect } from "react";

import Link from "@/shared/design-system/link";

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
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

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
        className={styles["recipes-page__quick-list-drawer"]}
        aria-label="Quick list recipes"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className={styles["recipes-page__quick-list"]}>
          <div className={styles["recipes-page__quick-list-head"]}>
            <h2 className={styles["recipes-page__quick-list-title"]}>
              Quick list
            </h2>
          </div>

          <div className={styles["recipes-page__quick-list-items"]}>
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={buildRecipeDetailRoute(projectId, recipe.recipeId)}
                className={styles["recipes-page__quick-list-card"]}
                onClick={() => {
                  onRecipeNavigate?.(recipe.recipeId);
                }}
              >
                <span className={styles["recipes-page__quick-list-card-title"]}>
                  {recipe.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default RecipesQuickListRail;
