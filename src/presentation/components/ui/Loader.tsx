"use client";

import React from "react";

import styles from "@/styles/components/ui/Loader.module.scss";

import { useTranslation } from "@/shared/i18n";

type LoaderVariant = "full-page" | "inline";

type Props = {
  variant?: LoaderVariant;
  message?: string;
  className?: string;
};

const Loader = ({ variant = "full-page", message, className }: Props) => {
  const t = useTranslation("common");
  const displayMessage = message || t("loading");

  const loaderClasses = [styles.loader, styles[`loader--${variant}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={loaderClasses}
      role="status"
      aria-live="polite"
      aria-label={t("loadingAriaLabel")}
    >
      <div className={styles["loader__spinner"]} aria-hidden="true" />
      <p className={styles["loader__message"]}>{displayMessage}</p>
    </div>
  );
};

export default React.memo(Loader);
