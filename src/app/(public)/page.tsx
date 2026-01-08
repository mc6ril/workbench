"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "@/presentation/components/ui/Button";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";

import { useTranslation } from "@/shared/i18n";

import styles from "./LandingPage.module.scss";

const LandingPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslation("pages.landing");
  const tCommon = useTranslation("common");

  // Handle Supabase code redirects
  // Supabase redirects to /?code=... instead of dedicated pages
  // Check type parameter to route to correct page
  useEffect(() => {
    const code = searchParams.get("code");
    const type = searchParams.get("type");

    if (code) {
      // Route based on type parameter
      if (type === "recovery") {
        // Password reset flow
        const email = searchParams.get("email");
        const params = new URLSearchParams({ code, type });
        if (email) {
          params.set("email", email);
        }
        router.replace(`/auth/update-password?${params.toString()}`);
      } else {
        // Email verification flow (default)
        router.replace(`/auth/verify-email?code=${encodeURIComponent(code)}`);
      }
    }
  }, [searchParams, router]);

  return (
    <main className={styles["landing-page"]}>
      <div className={styles["landing-container"]}>
        <div className={styles["landing-header"]}>
          <Title variant="h1" className={styles["landing-title"]}>
            {t("title")}
          </Title>
          <Text variant="body" className={styles["landing-subtitle"]}>
            {t("subtitle")}
          </Text>
        </div>

        <div className={styles["landing-content"]}>
          <section className={styles["landing-section"]}>
            <Title variant="h2" className={styles["landing-section-title"]}>
              {t("purposeTitle")}
            </Title>
            <Text variant="body" className={styles["landing-section-text"]}>
              {t("purposeText")}
            </Text>
          </section>

          <section className={styles["landing-section"]}>
            <Title variant="h2" className={styles["landing-section-title"]}>
              {t("featuresTitle")}
            </Title>
            <ul className={styles["landing-features-list"]}>
              <li>
                <Text variant="body" as="span">
                  <strong>{t("backlogLabel")}</strong>:{" "}
                  {t("backlogDescription")}
                </Text>
              </li>
              <li>
                <Text variant="body" as="span">
                  <strong>{t("boardLabel")}</strong>: {t("boardDescription")}
                </Text>
              </li>
              <li>
                <Text variant="body" as="span">
                  <strong>{t("epicsLabel")}</strong>: {t("epicsDescription")}
                </Text>
              </li>
              <li>
                <Text variant="body" as="span">
                  <strong>{t("subtasksLabel")}</strong>:{" "}
                  {t("subtasksDescription")}
                </Text>
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

const LandingPage = () => {
  const tCommon = useTranslation("common");

  return (
    <Suspense fallback={<div>{tCommon("loading")}</div>}>
      <LandingPageContent />
    </Suspense>
  );
};

export default LandingPage;
