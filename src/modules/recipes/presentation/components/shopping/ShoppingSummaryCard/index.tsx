import { getTranslations } from "next-intl/server";

import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "./styles.module.scss";

import {
  formatRecipeIngredientLabel,
  isAdditionCandidateIngredient,
} from "@/modules/recipes/core/domain/recipe.types";
import type { ShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";

type Props = {
  href: string;
  shoppingList: ShoppingList;
};

const ShoppingSummaryCard = async ({ href, shoppingList }: Props) => {
  const t = await getTranslations("pages.recipes.shopping");

  return (
    <Card
      variant="outlined"
      title={t("title")}
      footer={<Link href={href}>{t("openList")}</Link>}
    >
      <div className={styles["recipes-scaffold__shopping-stats"]}>
        <div className={styles["recipes-scaffold__metric"]}>
          <span className={styles["recipes-scaffold__metric-value"]}>
            {shoppingList.pendingCount}
          </span>
          <span className={styles["recipes-scaffold__metric-label"]}>
            {t("pendingCountLabel")}
          </span>
        </div>
        <div className={styles["recipes-scaffold__metric"]}>
          <span className={styles["recipes-scaffold__metric-value"]}>
            {shoppingList.checkedCount}
          </span>
          <span className={styles["recipes-scaffold__metric-label"]}>
            {t("checkedCountLabel")}
          </span>
        </div>
      </div>

      {shoppingList.groups.length === 0 ? (
        <div className={styles["recipes-scaffold__empty"]}>
          <p className={styles["recipes-scaffold__helper"]}>
            {t("emptyForGeneration")}
          </p>
        </div>
      ) : (
        <div className={styles["recipes-scaffold__shopping-groups"]}>
          {shoppingList.groups.map((group) => (
            <section
              key={group.id}
              className={styles["recipes-scaffold__shopping-group"]}
            >
              <div className={styles["recipes-scaffold__shopping-group-head"]}>
                <h3
                  className={styles["recipes-scaffold__shopping-group-title"]}
                >
                  {group.title}
                </h3>
                <span className={styles["recipes-scaffold__helper"]}>
                  {t("itemCount", { count: group.items.length })}
                </span>
              </div>

              <div className={styles["recipes-scaffold__shopping-items"]}>
                {group.items.map((item) => {
                  const isAddition = isAdditionCandidateIngredient(
                    item.ingredient
                  );

                  return (
                    <article
                      key={item.id}
                      className={[
                        styles["recipes-scaffold__shopping-item"],
                        item.checked &&
                          styles["recipes-scaffold__shopping-item--checked"],
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div
                        className={
                          styles["recipes-scaffold__shopping-item-top"]
                        }
                      >
                        <p
                          className={
                            styles["recipes-scaffold__shopping-item-label"]
                          }
                        >
                          {formatRecipeIngredientLabel(item.ingredient)}
                        </p>
                        {isAddition ? (
                          <span className={styles["recipes-scaffold__pill"]}>
                            {t("additionBadge")}
                          </span>
                        ) : null}
                      </div>

                      <p
                        className={
                          styles["recipes-scaffold__shopping-item-recipes"]
                        }
                      >
                        {item.recipes.map((recipe) => recipe.title).join(", ")}
                      </p>

                      {item.ingredient.notes ? (
                        <p
                          className={
                            styles["recipes-scaffold__shopping-item-note"]
                          }
                        >
                          {item.ingredient.notes}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ShoppingSummaryCard;
