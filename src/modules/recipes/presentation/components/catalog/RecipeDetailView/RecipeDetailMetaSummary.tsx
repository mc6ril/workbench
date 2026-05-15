import Text from "@/shared/design-system/text";

import styles from "./styles.module.scss";

type Props = {
  servingsLabel: string | null;
  totalTimeLabel: string | null;
  hero?: boolean;
};

const RecipeDetailMetaSummary = ({
  servingsLabel,
  totalTimeLabel,
  hero = false,
}: Props) => {
  const sectionClass = [
    styles["recipe-detail__section"],
    hero && styles["recipe-detail__section--hero"],
  ]
    .filter(Boolean)
    .join(" ");
  const itemClass = [
    styles["recipe-detail__meta-item"],
    hero && styles["recipe-detail__meta-item--hero"],
  ]
    .filter(Boolean)
    .join(" ");
  const valueClass = [
    styles["recipe-detail__meta-value"],
    hero && styles["recipe-detail__meta-value--hero"],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass}>
      <div className={styles["recipe-detail__meta-grid"]}>
        <article className={itemClass}>
          <Text as="span" variant="metric" className={valueClass}>
            {servingsLabel || "-"}
          </Text>
        </article>
        <article className={itemClass}>
          <Text as="span" variant="metric" className={valueClass}>
            {totalTimeLabel || "-"}
          </Text>
        </article>
      </div>
    </section>
  );
};

export default RecipeDetailMetaSummary;
