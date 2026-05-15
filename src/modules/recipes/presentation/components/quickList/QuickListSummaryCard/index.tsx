import { getTranslations } from "next-intl/server";

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

const QuickListSummaryCard = async ({ projectId, recipes }: Props) => {
  const t = await getTranslations("pages.recipes.quickListSummary");
  const isEmpty = recipes.length === 0;

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>
            {t("kicker")}
          </p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            {isEmpty
              ? t("titleEmpty")
              : t("titleFilled", { count: recipes.length })}
          </h2>
        </div>
      }
      footer={
        <Link href={buildRecipesQuickListRoute(projectId)}>{t("open")}</Link>
      }
    >
      {isEmpty ? (
        <p className={styles["recipes-scaffold__helper"]}>{t("empty")}</p>
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
                  <Badge
                    label={
                      recipe.status === "shopping_done"
                        ? t("shoppingDoneBadge")
                        : t("pendingBadge")
                    }
                    variant={
                      recipe.status === "shopping_done" ? "info" : "success"
                    }
                    size="small"
                  />
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
