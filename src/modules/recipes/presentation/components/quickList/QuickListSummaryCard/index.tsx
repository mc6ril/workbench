import { getTranslations } from "next-intl/server";

import Badge from "@/shared/design-system/badge";
import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";

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
          <Text
            as="span"
            variant="caption"
            className={styles["recipes-scaffold__panel-kicker"]}
          >
            {t("kicker")}
          </Text>
          <Title variant="h3">
            {isEmpty
              ? t("titleEmpty")
              : t("titleFilled", { count: recipes.length })}
          </Title>
        </div>
      }
      footer={
        <Link href={buildRecipesQuickListRoute(projectId)}>{t("open")}</Link>
      }
    >
      {isEmpty ? (
        <Text variant="small">{t("empty")}</Text>
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
                <Text variant="small">{recipe.servingsLabel}</Text>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
};

export default QuickListSummaryCard;
