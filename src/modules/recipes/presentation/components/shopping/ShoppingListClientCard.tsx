"use client";

import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import {
  formatRecipeIngredientLabel,
  isAdditionCandidateIngredient,
} from "@/modules/recipes/core/domain/recipe.types";
import type { ShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import {
  useListShoppingList,
  useSetShoppingListItemChecked,
} from "@/modules/recipes/presentation/hooks";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";
import { buildRecipesQuickListRoute } from "@/modules/recipes/presentation/routes";

type Props = {
  projectId: string;
  initialShoppingList: ShoppingList;
};

const ShoppingListClientCard = ({ projectId, initialShoppingList }: Props) => {
  const shoppingListQuery = useListShoppingList(projectId, {
    initialData: initialShoppingList,
  });
  const setItemCheckedMutation = useSetShoppingListItemChecked();
  const shoppingList = shoppingListQuery.data ?? initialShoppingList;
  const hasItems = shoppingList.groups.some((group) => group.items.length > 0);

  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Courses</p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            Todo list generee depuis les recettes actives
          </h2>
        </div>
      }
      footer={
        <Link href={buildRecipesQuickListRoute(projectId)}>
          Retour a la quick list
        </Link>
      }
    >
      <p className={styles["recipes-scaffold__panel-copy"]}>
        La generation reste prudente: on fusionne seulement les lignes
        compatibles, les ajouts a tester restent visibles et chaque item peut
        etre coche.
      </p>

      <div className={styles["recipes-scaffold__shopping-stats"]}>
        <div className={styles["recipes-scaffold__metric"]}>
          <span className={styles["recipes-scaffold__metric-value"]}>
            {shoppingList.pendingCount}
          </span>
          <span className={styles["recipes-scaffold__metric-label"]}>
            lignes encore a acheter
          </span>
        </div>
        <div className={styles["recipes-scaffold__metric"]}>
          <span className={styles["recipes-scaffold__metric-value"]}>
            {shoppingList.checkedCount}
          </span>
          <span className={styles["recipes-scaffold__metric-label"]}>
            lignes deja cochees
          </span>
        </div>
      </div>

      {!hasItems ? (
        <div className={styles["recipes-scaffold__empty"]}>
          <p className={styles["recipes-scaffold__helper"]}>
            Aucune recette active pour generer des courses pour le moment.
          </p>
          <Link href={buildRecipesQuickListRoute(projectId)}>
            Revenir a la quick list
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
                <h3 className={styles["recipes-scaffold__shopping-group-title"]}>
                  {group.title}
                </h3>
                <span className={styles["recipes-scaffold__helper"]}>
                  {group.items.length} ligne{group.items.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className={styles["recipes-scaffold__shopping-items"]}>
                {group.items.map((item) => {
                  const isAddition = isAdditionCandidateIngredient(item.ingredient);
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
                          styles["recipes-scaffold__shopping-item-button--checked"],
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

                      <span className={styles["recipes-scaffold__shopping-item-copy"]}>
                        <span
                          className={styles["recipes-scaffold__shopping-item-top"]}
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
                              Ajout
                            </span>
                          ) : null}
                        </span>

                        <span
                          className={
                            styles["recipes-scaffold__shopping-item-recipes"]
                          }
                        >
                          {item.recipes.map((recipe) => recipe.title).join(", ")}
                        </span>

                        {item.ingredient.notes ? (
                          <span
                            className={styles["recipes-scaffold__shopping-item-note"]}
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
        <p className={styles["recipes-scaffold__error"]}>
          La shopping list n&apos;a pas pu etre mise a jour. Reessayez.
        </p>
      ) : null}
    </Card>
  );
};

export default ShoppingListClientCard;
