import Button from "@/shared/design-system/button";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import type { TranslationFunction } from "@/shared/i18n";

import styles from "./styles.module.scss";

import type { CatalogRecipeDetail } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { formatRecipeIngredientLabel } from "@/modules/recipes/core/domain/recipe.types";

type Props = {
  additions: CatalogRecipeDetail["ingredients"];
  canValidateAdditions: boolean;
  validatingIngredientId?: string | null;
  isValidationPending?: boolean;
  onValidateAddition: (ingredientId: string) => Promise<void> | void;
  t: TranslationFunction;
};

const RecipeDetailAdditionsSection = ({
  additions,
  canValidateAdditions,
  validatingIngredientId = null,
  isValidationPending = false,
  onValidateAddition,
  t,
}: Props) => {
  if (additions.length === 0) {
    return null;
  }

  return (
    <section
      className={[
        styles["recipe-detail__section"],
        styles["recipe-detail__section--additions"],
      ].join(" ")}
    >
      <Title variant="h2" className={styles["recipe-detail__section-title"]}>
        {t("additions.title")}
      </Title>

      <div className={styles["recipe-detail__addition-list"]}>
        {additions.map((ingredient) => {
          const isPendingCurrentIngredient =
            isValidationPending && validatingIngredientId === ingredient.id;

          return (
            <article
              key={ingredient.id}
              className={styles["recipe-detail__addition-item"]}
            >
              <div className={styles["recipe-detail__addition-main"]}>
                <Title
                  variant="h4"
                  className={styles["recipe-detail__addition-title"]}
                >
                  {formatRecipeIngredientLabel(ingredient)}
                </Title>
                {ingredient.notes ? (
                  <Text
                    variant="small"
                    className={styles["recipe-detail__addition-note"]}
                  >
                    {ingredient.notes}
                  </Text>
                ) : null}
              </div>

              <div className={styles["recipe-detail__addition-actions"]}>
                <Button
                  label={
                    isPendingCurrentIngredient
                      ? t("additions.validating")
                      : t("additions.validate")
                  }
                  variant="primary"
                  className={styles["recipe-detail__addition-action"]}
                  disabled={!canValidateAdditions || isValidationPending}
                  onClick={() => {
                    void onValidateAddition(ingredient.id);
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default RecipeDetailAdditionsSection;
