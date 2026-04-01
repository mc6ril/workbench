import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";

type Props = {
  href: string;
  title: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
};

const CatalogPreviewPanel = ({
  href,
  title,
  description,
  highlights,
  ctaLabel,
}: Props) => {
  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Catalogue</p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>{title}</h2>
        </div>
      }
      footer={
        <Link href={href} className={styles["recipes-scaffold__route-link"]}>
          {ctaLabel}
        </Link>
      }
    >
      <p className={styles["recipes-scaffold__panel-copy"]}>{description}</p>
      <ul className={styles["recipes-scaffold__list"]}>
        {highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </Card>
  );
};

export default CatalogPreviewPanel;
