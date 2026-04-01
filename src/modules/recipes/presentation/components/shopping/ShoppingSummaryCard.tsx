import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import {
  formatRecipeIngredientLabel,
  isAdditionCandidateIngredient,
} from "@/modules/recipes/core/domain/recipe.types";
import type { ShoppingList } from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";

type Props = {
  href: string;
  shoppingList: ShoppingList;
  ctaLabel?: string;
};

const ShoppingSummaryCard = ({
  href,
  shoppingList,
  ctaLabel = "Ouvrir la shopping list",
}: Props) => {
  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Courses</p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            Liste generee a partir des ingredients normalises
          </h2>
        </div>
      }
      footer={<Link href={href}>{ctaLabel}</Link>}
    >
      <p className={styles["recipes-scaffold__panel-copy"]}>
        Les ingredients sont regroupes seulement quand le nom normalise,
        l&apos;unite et la quantite structuree rendent la fusion fiable.
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
                    <div className={styles["recipes-scaffold__shopping-item-top"]}>
                      <p className={styles["recipes-scaffold__shopping-item-label"]}>
                        {formatRecipeIngredientLabel(item.ingredient)}
                      </p>
                      {isAddition ? (
                        <span className={styles["recipes-scaffold__pill"]}>
                          Ajout a tester
                        </span>
                      ) : null}
                    </div>

                    <p className={styles["recipes-scaffold__shopping-item-recipes"]}>
                      {item.recipes.map((recipe) => recipe.title).join(", ")}
                    </p>

                    {item.ingredient.notes ? (
                      <p className={styles["recipes-scaffold__shopping-item-note"]}>
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
    </Card>
  );
};

export default ShoppingSummaryCard;
