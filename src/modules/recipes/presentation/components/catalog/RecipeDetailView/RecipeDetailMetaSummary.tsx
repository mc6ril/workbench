import Text from "@/shared/design-system/text";
import type { TranslationFunction } from "@/shared/i18n";

import styles from "./styles.module.scss";

type Props = {
  servingsLabel: string | null;
  totalTimeLabel: string | null;
  seasonalMonths: number[];
  locale: string;
  t: TranslationFunction;
};

const MONTH_DATE_BASE = [
  new Date(2024, 0, 1),
  new Date(2024, 1, 1),
  new Date(2024, 2, 1),
  new Date(2024, 3, 1),
  new Date(2024, 4, 1),
  new Date(2024, 5, 1),
  new Date(2024, 6, 1),
  new Date(2024, 7, 1),
  new Date(2024, 8, 1),
  new Date(2024, 9, 1),
  new Date(2024, 10, 1),
  new Date(2024, 11, 1),
];

const RecipeDetailMetaSummary = ({
  servingsLabel,
  totalTimeLabel,
  seasonalMonths,
  locale,
  t,
}: Props) => {
  const fmt = new Intl.DateTimeFormat(locale, { month: "short" });
  const sortedMonths = [...seasonalMonths].sort((a, b) => a - b);

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
      {sortedMonths.length > 0 && (
        <div className={styles["recipe-detail__season-row"]}>
          {sortedMonths.map((month) => (
            <Text
              key={month}
              as="span"
              variant="caption"
              className={styles["recipe-detail__season-chip"]}
            >
              {fmt.format(MONTH_DATE_BASE[month - 1])}
            </Text>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecipeDetailMetaSummary;
