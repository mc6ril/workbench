import Card from "@/shared/design-system/card";
import Link from "@/shared/design-system/link";

import styles from "@/modules/recipes/presentation/pages/shared/styles.module.scss";

type Props = {
  href: string;
};

const SHOPPING_GROUPS = [
  {
    title: "Primeur",
    items: [
      { label: "2 citrons jaunes", checked: true },
      { label: "1 concombre mini", checked: false },
      { label: "1 botte de coriandre", checked: false },
    ],
  },
  {
    title: "Epicerie",
    items: [
      { label: "180 g de riz basmati", checked: true },
      { label: "1 sachet de sumac", checked: false },
    ],
  },
];

const ShoppingSummaryCard = ({ href }: Props) => {
  return (
    <Card
      variant="outlined"
      title={
        <div className={styles["recipes-scaffold__panel-head"]}>
          <p className={styles["recipes-scaffold__panel-kicker"]}>Courses</p>
          <h2 className={styles["recipes-scaffold__panel-title"]}>
            Checklist future-proof
          </h2>
        </div>
      }
      footer={<Link href={href}>Ouvrir la shopping list</Link>}
    >
      <p className={styles["recipes-scaffold__panel-copy"]}>
        La structure shopping est separee du catalogue des maintenant, pour
        brancher la vraie aggregation plus tard sans refaire les routes.
      </p>
      <div className={styles["recipes-scaffold__checklist"]}>
        {SHOPPING_GROUPS.map((group) => (
          <div
            key={group.title}
            className={styles["recipes-scaffold__checklist-group"]}
          >
            <span className={styles["recipes-scaffold__checklist-title"]}>
              {group.title}
            </span>
            {group.items.map((item) => (
              <span
                key={item.label}
                className={[
                  styles["recipes-scaffold__checklist-item"],
                  item.checked &&
                    styles["recipes-scaffold__checklist-item--checked"],
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ShoppingSummaryCard;
