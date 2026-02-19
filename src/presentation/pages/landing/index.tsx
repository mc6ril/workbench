"use client";

import { Suspense, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, Text } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

const VALUE_KEYS = Object.freeze(["simplicity", "clarity", "control"]);
const FEATURE_KEYS = Object.freeze(["backlog", "board", "epics", "subtasks"]);

const LandingPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tHero = useTranslation("pages.landing.hero");
  const tValues = useTranslation("pages.landing.values");
  const tFeatures = useTranslation("pages.landing.features");
  const tTrust = useTranslation("pages.landing.trust");
  const tCta = useTranslation("pages.landing.cta");
  const tFooter = useTranslation("pages.landing.footer");

  // Supabase redirects to /?code=... instead of dedicated pages
  useEffect(() => {
    const code = searchParams.get("code");
    const type = searchParams.get("type");

    if (code) {
      if (type === "recovery") {
        const email = searchParams.get("email");
        const params = new URLSearchParams({ code, type });
        if (email) {
          params.set("email", email);
        }
        router.replace(`/auth/update-password?${params.toString()}`);
      } else {
        router.replace(`/auth/verify-email?code=${encodeURIComponent(code)}`);
      }
    }
  }, [searchParams, router]);

  const handleSignUp = useCallback(() => {
    router.push("/auth/signup");
  }, [router]);

  const handleSignIn = useCallback(() => {
    router.push("/auth/signin");
  }, [router]);

  return (
    <main className={styles["landing-page"]}>
      {/* Hero */}
      <header className={styles["landing-hero"]}>
        <div className={styles["landing-hero__content"]}>
          <h1
            className={styles["landing-hero__title"]}
            id={getAccessibilityId("landing-hero-title")}
          >
            {tHero("title")}
          </h1>
          <Text
            variant="body"
            className={styles["landing-hero__subtitle"]}
            aria-label={tHero("subtitle")}
          >
            {tHero("subtitle")}
          </Text>
          <div className={styles["landing-hero__actions"]}>
            <Button
              label={tHero("ctaSignUp")}
              onClick={handleSignUp}
              aria-label={tHero("ctaSignUp")}
            />
            <Button
              label={tHero("ctaSignIn")}
              variant="secondary"
              onClick={handleSignIn}
              aria-label={tHero("ctaSignIn")}
            />
          </div>
        </div>
      </header>

      <div className={styles["landing-container"]}>
        {/* Values */}
        <section
          className={styles["values-section"]}
          aria-labelledby={getAccessibilityId("landing-values-title")}
        >
          <h2
            className={styles["section-title"]}
            id={getAccessibilityId("landing-values-title")}
          >
            {tValues("title")}
          </h2>
          <div className={styles["values-grid"]} role="list">
            {VALUE_KEYS.map((key) => (
              <article
                key={key}
                className={styles["value-card"]}
                role="listitem"
              >
                <span
                  className={styles["value-card__icon"]}
                  aria-hidden="true"
                >
                  {tValues(`${key}.icon`)}
                </span>
                <h3 className={styles["value-card__title"]}>
                  {tValues(`${key}.title`)}
                </h3>
                <Text
                  variant="body"
                  className={styles["value-card__description"]}
                >
                  {tValues(`${key}.description`)}
                </Text>
              </article>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          className={styles["features-section"]}
          aria-labelledby={getAccessibilityId("landing-features-title")}
        >
          <h2
            className={styles["section-title"]}
            id={getAccessibilityId("landing-features-title")}
          >
            {tFeatures("title")}
          </h2>
          <div className={styles["features-grid"]} role="list">
            {FEATURE_KEYS.map((key) => (
              <article
                key={key}
                className={styles["feature-card"]}
                role="listitem"
              >
                <span
                  className={styles["feature-card__icon"]}
                  aria-hidden="true"
                >
                  {tFeatures(`${key}.icon`)}
                </span>
                <div className={styles["feature-card__content"]}>
                  <h3 className={styles["feature-card__title"]}>
                    {tFeatures(`${key}.title`)}
                  </h3>
                  <Text
                    variant="body"
                    className={styles["feature-card__description"]}
                  >
                    {tFeatures(`${key}.description`)}
                  </Text>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section
          className={styles["trust-section"]}
          aria-labelledby={getAccessibilityId("landing-trust-title")}
        >
          <h2
            className={styles["trust-section__title"]}
            id={getAccessibilityId("landing-trust-title")}
          >
            {tTrust("title")}
          </h2>
          <Text
            variant="body"
            className={styles["trust-section__description"]}
          >
            {tTrust("description")}
          </Text>
          <div className={styles["trust-badges"]} role="list">
            <span className={styles["trust-badge"]} role="listitem">
              <span className={styles["trust-badge__check"]} aria-hidden="true">
                ✓
              </span>
              {tTrust("freeForever")}
            </span>
            <span className={styles["trust-badge"]} role="listitem">
              <span className={styles["trust-badge__check"]} aria-hidden="true">
                ✓
              </span>
              {tTrust("noCreditCard")}
            </span>
            <span className={styles["trust-badge"]} role="listitem">
              <span className={styles["trust-badge__check"]} aria-hidden="true">
                ✓
              </span>
              {tTrust("noComplexity")}
            </span>
          </div>
        </section>

        {/* CTA */}
        <section
          className={styles["cta-section"]}
          aria-labelledby={getAccessibilityId("landing-cta-title")}
        >
          <h2
            className={styles["cta-section__title"]}
            id={getAccessibilityId("landing-cta-title")}
          >
            {tCta("title")}
          </h2>
          <Text
            variant="body"
            className={styles["cta-section__description"]}
          >
            {tCta("description")}
          </Text>
          <Button
            label={tCta("button")}
            onClick={handleSignUp}
            aria-label={tCta("button")}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className={styles["landing-footer"]}>
        <nav className={styles["landing-footer__nav"]} aria-label="Footer">
          <Link href="/legal" className={styles["landing-footer__link"]}>
            {tFooter("legal")}
          </Link>
          <Link href="/pricing" className={styles["landing-footer__link"]}>
            {tFooter("pricing")}
          </Link>
        </nav>
      </footer>
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
