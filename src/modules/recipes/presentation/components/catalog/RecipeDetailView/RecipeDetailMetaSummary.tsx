import Text from "@/shared/design-system/text";

import styles from "./styles.module.scss";

type Props = {
  servingsLabel: string | null;
  totalTimeLabel: string | null;
};

const RecipeDetailMetaSummary = ({ servingsLabel, totalTimeLabel }: Props) => {
  return (
    <section className={styles["recipe-detail__section"]}>
      <div className={styles["recipe-detail__meta-grid"]}>
        <article className={styles["recipe-detail__meta-item"]}>
          <Text as="span" variant="metric" className={styles["recipe-detail__meta-value"]}>
            {servingsLabel || "-"}
          </Text>
        </article>
        <article className={styles["recipe-detail__meta-item"]}>
          <Text as="span" variant="metric" className={styles["recipe-detail__meta-value"]}>
            {totalTimeLabel || "-"}
          </Text>
        </article>
      </div>
    </section>
  );
};

export default RecipeDetailMetaSummary;
