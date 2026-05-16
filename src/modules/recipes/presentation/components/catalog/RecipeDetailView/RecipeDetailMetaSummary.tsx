import Text from "@/shared/design-system/text";
import type { TranslationFunction } from "@/shared/i18n";

import styles from "./styles.module.scss";

type Props = {
  servingsLabel: string | null;
  totalTimeLabel: string | null;
  t: TranslationFunction;
};

const RecipeDetailMetaSummary = ({
  servingsLabel,
  totalTimeLabel,
  t,
}: Props) => {
  return (
    <section className={styles["recipe-detail__section"]}>
      <div className={styles["recipe-detail__meta-grid"]}>
        <div className={styles["recipe-detail__meta-item"]}>
          <Text
            as="span"
            variant="metric"
            className={styles["recipe-detail__meta-value"]}
          >
            {servingsLabel || "-"}
          </Text>
          <Text
            as="span"
            variant="caption"
            className={styles["recipe-detail__meta-label"]}
          >
            {t("meta.servings")}
          </Text>
        </div>
        <div className={styles["recipe-detail__meta-item"]}>
          <Text
            as="span"
            variant="metric"
            className={styles["recipe-detail__meta-value"]}
          >
            {totalTimeLabel || "-"}
          </Text>
          <Text
            as="span"
            variant="caption"
            className={styles["recipe-detail__meta-label"]}
          >
            {t("meta.totalTime")}
          </Text>
        </div>
      </div>
    </section>
  );
};

export default RecipeDetailMetaSummary;
