import React from "react";

import { Input } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./AppHeader.module.scss";

type Props = {
  title: string;
  actions?: React.ReactNode;
  className?: string;
};

const AppHeader = ({ title, actions, className }: Props) => {
  const headerId = getAccessibilityId("app-header");
  const titleId = getAccessibilityId("app-header-title");

  const headerClasses = [styles["app-header"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <header id={headerId} className={headerClasses} aria-labelledby={titleId}>
      <div className={styles["app-header__content"]}>
        <div className={styles["app-header__title"]}>
          <Input
            placeholder={title}
            aria-label={title}
            inline
          />
        </div>
        {actions && (
          <div className={styles["app-header__actions"]}>{actions}</div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
