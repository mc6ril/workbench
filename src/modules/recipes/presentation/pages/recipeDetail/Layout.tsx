import type { ReactNode } from "react";

import Title from "@/shared/design-system/title";

import styles from "./styles.module.scss";

type Props = {
  title: string;
  children: ReactNode;
};

const Layout = ({ title, children }: Props) => {
  return (
    <div className={styles["recipe-detail-page"]}>
      <header className={styles["recipe-detail-page__header"]}>
        <Title variant="h1" className={styles["recipe-detail-page__title"]}>
          {title}
        </Title>
      </header>
      {children}
    </div>
  );
};

export default Layout;
