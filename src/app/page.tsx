"use client";

import Link from "next/link";

import Button from "@/presentation/components/ui/Button";

import { useTranslation } from "@/shared/i18n";

import styles from "./LandingPage.module.scss";

export default function LandingPage() {
  const t = useTranslation("pages.landing");
  const tCommon = useTranslation("common");

  return (
    <main className={styles["landing-page"]}>
      <div className={styles["landing-container"]}>
        <div className={styles["landing-header"]}>
          <h1 className={styles["landing-title"]}>{t("title")}</h1>
          <p className={styles["landing-subtitle"]}>{t("subtitle")}</p>
        </div>

        <div className={styles["landing-content"]}>
          <section className={styles["landing-section"]}>
            <h2 className={styles["landing-section-title"]}>
              {t("purposeTitle")}
            </h2>
            <p className={styles["landing-section-text"]}>
              {t("purposeText")}
            </p>
          </section>

          <section className={styles["landing-section"]}>
            <h2 className={styles["landing-section-title"]}>
              {t("featuresTitle")}
            </h2>
            <ul className={styles["landing-features-list"]}>
              <li>
                <strong>{t("backlogLabel")}</strong>: {t("backlogDescription")}
              </li>
              <li>
                <strong>{t("boardLabel")}</strong>: {t("boardDescription")}
              </li>
              <li>
                <strong>{t("epicsLabel")}</strong>: {t("epicsDescription")}
              </li>
              <li>
                <strong>{t("subtasksLabel")}</strong>: {t("subtasksDescription")}
              </li>
            </ul>
          </section>

          <div className={styles["landing-actions"]}>
            <Link href="/signin">
              <Button
                label={tCommon("signIn")}
                onClick={() => {}}
                aria-label={tCommon("signIn")}
              />
            </Link>
            <Link href="/signup">
              <Button
                label={tCommon("signUp")}
                variant="secondary"
                onClick={() => {}}
                aria-label={tCommon("signUp")}
              />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
