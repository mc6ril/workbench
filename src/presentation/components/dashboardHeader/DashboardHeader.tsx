import React from "react";

import { Text,Title } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y/constants";

import styles from "./DashboardHeader.module.scss";

type Props = {
  title: string;
  subtitle?: string;
  quickActions?: React.ReactNode;
  className?: string;
};

const DashboardHeader = ({
  title,
  subtitle,
  quickActions,
  className,
}: Props) => {
  const headerId = getAccessibilityId("dashboard-header");
  const titleId = getAccessibilityId("dashboard-header-title");

  const headerClasses = [styles["dashboard-header"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <header id={headerId} className={headerClasses}>
      <div className={styles["dashboard-header__content"]}>
        <div className={styles["dashboard-header__text"]}>
          <Title id={titleId} variant="h1" className={styles["dashboard-header__title"]}>
            {title}
          </Title>
          {subtitle && (
            <Text
              variant="body"
              className={styles["dashboard-header__subtitle"]}
            >
              {subtitle}
            </Text>
          )}
        </div>
        {quickActions && (
          <div className={styles["dashboard-header__actions"]}>
            {quickActions}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;