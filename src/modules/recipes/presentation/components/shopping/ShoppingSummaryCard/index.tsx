import { getTranslations } from "next-intl/server";

import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";

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
          <Text as="span" variant="caption">
            {t("pendingCountLabel")}
          </Text>
        </div>
        <div className={styles["recipes-scaffold__metric"]}>
          <span className={styles["recipes-scaffold__metric-value"]}>
            {shoppingList.checkedCount}
          </span>
          <Text as="span" variant="caption">
            {t("checkedCountLabel")}
          </Text>
        </div>
      </div>

      {shoppingList.groups.length === 0 ? (
        <div className={styles["recipes-scaffold__empty"]}>
          <Text variant="small">{t("emptyForGeneration")}</Text>
        </div>
      ) : (
        <div className={styles["recipes-scaffold__shopping-groups"]}>
          {shoppingList.groups.map((group) => (
            <section
              key={group.id}
              className={styles["recipes-scaffold__shopping-group"]}
            >
              <div className={styles["recipes-scaffold__shopping-group-head"]}>
                <Title variant="h4">{group.title}</Title>
                <Text as="span" variant="small">
                  {t("itemCount", { count: group.items.length })}
                </Text>
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
                        <Text
                          className={
                            styles["recipes-scaffold__shopping-item-label"]
                          }
                        >
                          {formatRecipeIngredientLabel(item.ingredient)}
                        </Text>
                        {isAddition ? (
                          <span className={styles["recipes-scaffold__pill"]}>
                            {t("additionBadge")}
                          </span>
                        ) : null}
                      </div>

                      <Text variant="small">
                        {item.recipes.map((recipe) => recipe.title).join(", ")}
                      </Text>

                      {item.ingredient.notes ? (
                        <Text variant="small">{item.ingredient.notes}</Text>
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
