"use client";

import { useTranslations } from "next-intl";

import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "./styles.module.scss";

import {
  formatRecipeIngredientLabel,
  isAdditionCandidateIngredient,
} from "@/modules/recipes/core/domain/recipe.types";
import type { ShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import { useListShoppingList } from "@/modules/recipes/presentation/hooks/shopping/listShoppingList";
import { useSetShoppingListItemChecked } from "@/modules/recipes/presentation/hooks/shopping/useSetShoppingListItemChecked";
import { buildRecipesQuickListRoute } from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  initialShoppingList: ShoppingList;
};

const ShoppingListClientCard = ({ projectId, initialShoppingList }: Props) => {
  const t = useTranslations("pages.recipes.shopping");
  const shoppingListQuery = useListShoppingList(projectId, {
    initialData: initialShoppingList,
  });
  const setItemCheckedMutation = useSetShoppingListItemChecked();
  const shoppingList = shoppingListQuery.data ?? initialShoppingList;
  const hasItems = shoppingList.groups.some((group) => group.items.length > 0);

  return (
    <Card
      variant="outlined"
      title={t("title")}
      footer={
        <Link href={buildRecipesQuickListRoute(projectId)}>
          {t("viewMeals")}
        </Link>
      }
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

      {!hasItems ? (
        <div className={styles["recipes-scaffold__empty"]}>
          <p className={styles["recipes-scaffold__helper"]}>{t("empty")}</p>
          <Link href={buildRecipesQuickListRoute(projectId)}>
            {t("viewMeals")}
          </Link>
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
                  const isPendingCurrentItem =
                    setItemCheckedMutation.isPending &&
                    setItemCheckedMutation.variables?.itemId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="checkbox"
                      aria-checked={item.checked}
                      disabled={isPendingCurrentItem}
                      className={[
                        styles["recipes-scaffold__shopping-item-button"],
                        item.checked &&
                          styles[
                            "recipes-scaffold__shopping-item-button--checked"
                          ],
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => {
                        setItemCheckedMutation.mutate({
                          projectId,
                          itemId: item.id,
                          checked: !item.checked,
                        });
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          styles["recipes-scaffold__shopping-check"],
                          item.checked &&
                            styles["recipes-scaffold__shopping-check--checked"],
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />

                      <span
                        className={
                          styles["recipes-scaffold__shopping-item-copy"]
                        }
                      >
                        <span
                          className={
                            styles["recipes-scaffold__shopping-item-top"]
                          }
                        >
                          <span
                            className={
                              styles["recipes-scaffold__shopping-item-label"]
                            }
                          >
                            {formatRecipeIngredientLabel(item.ingredient)}
                          </span>
                          {isAddition ? (
                            <span className={styles["recipes-scaffold__pill"]}>
                              {t("additionBadge")}
                            </span>
                          ) : null}
                        </span>

                        <span
                          className={
                            styles["recipes-scaffold__shopping-item-recipes"]
                          }
                        >
                          {item.recipes
                            .map((recipe) => recipe.title)
                            .join(", ")}
                        </span>

                        {item.ingredient.notes ? (
                          <span
                            className={
                              styles["recipes-scaffold__shopping-item-note"]
                            }
                          >
                            {item.ingredient.notes}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {setItemCheckedMutation.isError ? (
        <p className={styles["recipes-scaffold__error"]}>{t("updateFailed")}</p>
      ) : null}
    </Card>
  );
};

export default ShoppingListClientCard;
