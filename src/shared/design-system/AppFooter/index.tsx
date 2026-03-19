"use client";

import React from "react";

import { getAccessibilityId } from "@/shared/a11y/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./AppFooter.module.scss";

type Props = {
  className?: string;
};

const AppFooter = ({ className }: Props) => {
  const t = useTranslation("layout.appFooter");

  const footerId = getAccessibilityId("app-footer");

  const footerClasses = [styles["app-footer"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <footer
      id={footerId}
      className={footerClasses}
      aria-label={t("ariaLabel")}
    >
      <div className={styles["app-footer__content"]}>{t("label")}</div>
    </footer>
  );
};

export default React.memo(AppFooter);

