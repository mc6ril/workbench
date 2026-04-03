import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import type { TranslationFunction } from "@/shared/i18n";

import styles from "./styles.module.scss";

import type { CatalogRecipeDetail } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";

type Props = {
  steps: CatalogRecipeDetail["steps"];
  t: TranslationFunction;
};

const RecipeDetailStepsSection = ({ steps, t }: Props) => {
  return (
    <section
      className={[
        styles["recipe-detail__section"],
        styles["recipe-detail__section--steps"],
      ].join(" ")}
    >
      {steps.length === 0 ? (
        <Text variant="small" className={styles["recipe-detail__empty-copy"]}>
          {t("steps.empty")}
        </Text>
      ) : (
        <ol className={styles["recipe-detail__step-list"]}>
          {steps.map((step) => (
            <li key={step.id} className={styles["recipe-detail__step-item"]}>
              <div className={styles["recipe-detail__step-copy"]}>
                <div className={styles["recipe-detail__step-topline"]}>
                  <Text
                    as="span"
                    variant="caption"
                    className={styles["recipe-detail__step-index"]}
                  >
                    {step.position}
                  </Text>
                  <Title
                    variant="h3"
                    className={styles["recipe-detail__step-label"]}
                  >
                    {t("steps.label", { position: step.position })}
                  </Title>
                  {step.meta ? (
                    <Text
                      as="span"
                      variant="caption"
                      className={styles["recipe-detail__step-meta"]}
                    >
                      {step.meta}
                    </Text>
                  ) : null}
                </div>
                {step.title ? (
                  <Title
                    variant="h4"
                    className={styles["recipe-detail__step-title"]}
                  >
                    {step.title}
                  </Title>
                ) : null}
                <Text
                  variant="body"
                  className={styles["recipe-detail__step-instruction"]}
                >
                  {step.instruction}
                </Text>
                {step.notes ? (
                  <Text
                    variant="small"
                    className={styles["recipe-detail__step-note"]}
                  >
                    {step.notes}
                  </Text>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default RecipeDetailStepsSection;
