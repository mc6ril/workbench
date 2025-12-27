"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/presentation/components/ui/Button";

import { useTranslation } from "@/shared/i18n";

import styles from "./LandingPage.module.scss";

const LandingPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslation("pages.landing");
  const tCommon = useTranslation("common");

  // Handle Supabase email verification code redirect
  // Supabase redirects to /?code=... instead of /auth/verify-email?token=...
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      // Redirect to verify-email page with code parameter
      router.replace(`/auth/verify-email?code=${encodeURIComponent(code)}`);
    }
  }, [searchParams, router]);

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
            <p className={styles["landing-section-text"]}>{t("purposeText")}</p>
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
                <strong>{t("subtasksLabel")}</strong>:{" "}
                {t("subtasksDescription")}
              </li>
            </ul>
          </section>

          <div className={styles["landing-actions"]}>
            <Link href="/auth/signin">
              <Button
                label={tCommon("signIn")}
                onClick={() => {}}
                aria-label={tCommon("signIn")}
              />
            </Link>
            <Link href="/auth/signup">
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
};

export default function LandingPage() {
  const tCommon = useTranslation("common");

  return (
    <Suspense fallback={<div>{tCommon("loading")}</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
