import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import type { TranslationFunction } from "@/shared/i18n";

import styles from "./styles.module.scss";

import type { CatalogRecipeDetail } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { formatRecipeIngredientLabel } from "@/modules/recipes/core/domain/recipe.types";

type Props = {
  ingredients: CatalogRecipeDetail["ingredients"];
  t: TranslationFunction;
};

const RecipeDetailIngredientsSection = ({ ingredients, t }: Props) => {
  return (
    <section
      className={[
        styles["recipe-detail__section"],
        styles["recipe-detail__section--ingredients"],
      ].join(" ")}
    >
      <div className={styles["recipe-detail__section-head"]}>
        <Title variant="h2" className={styles["recipe-detail__section-title"]}>
          {t("ingredients.title")}
        </Title>
      </div>

      {ingredients.length === 0 ? (
        <Text variant="small" className={styles["recipe-detail__empty-copy"]}>
          {t("ingredients.empty")}
        </Text>
      ) : (
        <ul className={styles["recipe-detail__ingredient-list"]}>
          {ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className={styles["recipe-detail__ingredient-item"]}
            >
              <Text
                as="span"
                variant="body"
                className={styles["recipe-detail__ingredient-primary"]}
              >
                {formatRecipeIngredientLabel(ingredient)}
              </Text>
              {ingredient.notes ? (
                <Text
                  as="span"
                  variant="small"
                  className={styles["recipe-detail__ingredient-secondary"]}
                >
                  {ingredient.notes}
                </Text>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RecipeDetailIngredientsSection;
