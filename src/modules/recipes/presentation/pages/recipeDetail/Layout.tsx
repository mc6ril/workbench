import type { ReactNode } from "react";

import Link from "@/shared/design-system/link";
import Title from "@/shared/design-system/title";

import styles from "./styles.module.scss";

type Props = {
  title: string;
  editHref: string;
  editLabel: string;
  editAriaLabel: string;
  children: ReactNode;
};

const Layout = ({
  title,
  editHref,
  editLabel,
  editAriaLabel,
  children,
}: Props) => {
  return (
    <div className={styles["recipe-detail-page"]}>
      <header className={styles["recipe-detail-page__header"]}>
        <div className={styles["recipe-detail-page__header-row"]}>
          <span
            className={styles["recipe-detail-page__header-spacer"]}
            aria-hidden
          />
          <Title variant="h1" className={styles["recipe-detail-page__title"]}>
            {title}
          </Title>
          <Link
            href={editHref}
            variant="secondary"
            className={styles["recipe-detail-page__edit"]}
            ariaLabel={editAriaLabel}
          >
            {editLabel}
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
};

export default Layout;
