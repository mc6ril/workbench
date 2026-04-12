import type { ReactNode } from "react";

import Link from "@/shared/design-system/link";
import Title from "@/shared/design-system/title";

import styles from "./styles.module.scss";

type RecipesPageAction = {
  href: string;
  label: string;
  variant?: "default" | "primary" | "secondary";
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: RecipesPageAction[];
  aside?: ReactNode;
  children: ReactNode;
};

const RecipesPageScaffold = ({
  eyebrow,
  title,
  description,
  actions = [],
  aside,
  children,
}: Props) => {
  return (
    <div className={styles["recipes-scaffold"]}>
      <section className={styles["recipes-scaffold__hero"]}>
        <div className={styles["recipes-scaffold__hero-copy"]}>
          <p className={styles["recipes-scaffold__eyebrow"]}>{eyebrow}</p>
          <Title variant="h1" className={styles["recipes-scaffold__title"]}>
            {title}
          </Title>
          <p className={styles["recipes-scaffold__description"]}>
            {description}
          </p>
          {actions.length > 0 ? (
            <div className={styles["recipes-scaffold__actions"]}>
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  variant={action.variant ?? "default"}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {aside ? (
          <div className={styles["recipes-scaffold__hero-aside"]}>{aside}</div>
        ) : null}
      </section>

      <div className={styles["recipes-scaffold__content"]}>{children}</div>
    </div>
  );
};

export default RecipesPageScaffold;
