"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y";
import {
  HERO_PROOF_KEYS,
  IMPACT_KEYS,
  PREVIEW_COLUMNS,
  RHYTHM_KEYS,
  VALUE_KEYS,
} from "@/shared/constants/landing";
import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/button";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";
import { useMarketingRoutes } from "@/shared/i18n/useMarketingRoutes";
import { buildFeaturePreviewContent } from "@/shared/utils";
import {
  buildAuthCallbackPath,
  getAuthCodeRedirectTarget,
  sanitizeInternalRedirectPath,
} from "@/shared/utils/authRedirect";

import styles from "./styles.module.scss";

import { useBillingVisibility } from "@/domains/billing/presentation/hooks/useBillingVisibility";

const LandingPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tHero = useTranslation("pages.landing.hero");
  const tValues = useTranslation("pages.landing.values");
  const tFeatures = useTranslation("pages.landing.features");
  const tExamples = useTranslation("pages.landing.examples");
  const tImpact = useTranslation("pages.landing.impact");
  const tRhythm = useTranslation("pages.landing.rhythm");
  const tCta = useTranslation("pages.landing.cta");
  const tFooter = useTranslation("pages.landing.footer");
  const { legal, pricing } = useMarketingRoutes();
  const { data: isBillingVisible } = useBillingVisibility();

  // Some Supabase flows can still bounce through the site root with ?code=...
  // Route them back through the server callback so the session is exchanged
  // before we land on the final client page.
  useEffect(() => {
    const code = searchParams.get("code");
    const type = searchParams.get("type");
    const next = searchParams.get("next");

    if (code) {
      const nextPath = sanitizeInternalRedirectPath(
        next,
        getAuthCodeRedirectTarget(type)
      );

      router.replace(
        buildAuthCallbackPath({
          code,
          nextPath,
          fallbackPath: getAuthCodeRedirectTarget(type),
        })
      );
    }
  }, [searchParams, router]);

  const handleSignUp = useCallback(() => {
    router.push(AUTH_PAGE_ROUTES.SIGNUP);
  }, [router]);

  const handleSignIn = useCallback(() => {
    router.push(AUTH_PAGE_ROUTES.SIGNIN);
  }, [router]);

  const handleScrollToPreview = useCallback(() => {
    const target = document.getElementById(
      getAccessibilityId("landing-example-preview")
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const featurePreview = buildFeaturePreviewContent("board", tExamples);

  return (
    <main className={styles["landing-page"]}>
      {/* Hero */}
      <header className={styles["landing-hero"]}>
        <div className={styles["landing-hero__aurora"]} aria-hidden="true" />
        <div className={styles["landing-hero__content"]}>
          <div
            className={styles["landing-hero__brand"]}
            aria-label={tHero("logoAriaLabel")}
          >
            <span
              className={styles["landing-hero__brand-mark"]}
              aria-hidden="true"
            >
              TN
            </span>
            <span className={styles["landing-hero__brand-name"]}>
              Tribu Nova
            </span>
          </div>
          <span className={styles["landing-hero__pill"]}>
            {tHero("brandPill")}
          </span>
          <Title
            variant="h1"
            className={styles["landing-hero__title"]}
            id={getAccessibilityId("landing-hero-title")}
          >
            {tHero("title")}
          </Title>
          <Text
            variant="body"
            className={styles["landing-hero__subtitle"]}
            aria-label={tHero("subtitle")}
          >
            {tHero("subtitle")}
          </Text>
          <div className={styles["landing-hero__proofs"]} role="list">
            {HERO_PROOF_KEYS.map((proofKey) => (
              <span
                key={proofKey}
                className={styles["landing-hero__proof"]}
                role="listitem"
              >
                {tHero(proofKey)}
              </span>
            ))}
          </div>
          <div className={styles["landing-hero__actions"]}>
            <Button
              label={tHero("ctaSignUp")}
              onClick={handleSignUp}
              aria-label={tHero("ctaSignUp")}
            />
            <Button
              label={tHero("ctaSignIn")}
              variant="ghost"
              onClick={handleSignIn}
              aria-label={tHero("ctaSignIn")}
            />
            <Button
              label={tHero("ctaPreview")}
              variant="secondary"
              onClick={handleScrollToPreview}
              aria-label={tHero("ctaPreview")}
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
          <Title
            variant="h2"
            className={styles["section-title"]}
            id={getAccessibilityId("landing-values-title")}
          >
            {tValues("title")}
          </Title>
          <div className={styles["values-grid"]} role="list">
            {VALUE_KEYS.map((key) => (
              <article
                key={key}
                className={styles["value-card"]}
                role="listitem"
              >
                <span className={styles["value-card__icon"]} aria-hidden="true">
                  {tValues(`${key}.icon`)}
                </span>
                <Title variant="h3">{tValues(`${key}.title`)}</Title>
                <Text variant="body">{tValues(`${key}.description`)}</Text>
              </article>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          className={styles["features-section"]}
          aria-labelledby={getAccessibilityId("landing-features-title")}
        >
          <Title
            variant="h2"
            className={styles["section-title"]}
            id={getAccessibilityId("landing-features-title")}
          >
            {tFeatures("title")}
          </Title>
          <section
            id={getAccessibilityId("landing-example-preview")}
            className={styles["landing-example-preview"]}
            aria-labelledby={getAccessibilityId(
              "landing-example-preview-title"
            )}
          >
            <Title
              variant="h3"
              id={getAccessibilityId("landing-example-preview-title")}
              className={styles["landing-example-preview__title"]}
            >
              {tExamples("title")}
            </Title>
            <Text
              variant="body"
              className={styles["landing-example-preview__description"]}
            >
              {featurePreview.title} - {featurePreview.description}
            </Text>
            <div className={styles["landing-example-preview__surface"]}>
              <div className={styles["landing-example-preview__toolbar"]}>
                <span
                  className={styles["landing-example-preview__dot"]}
                  aria-hidden="true"
                />
                <span
                  className={styles["landing-example-preview__dot"]}
                  aria-hidden="true"
                />
                <span
                  className={styles["landing-example-preview__dot"]}
                  aria-hidden="true"
                />
                <span className={styles["landing-example-preview__app-name"]}>
                  Tribu Nova
                </span>
              </div>
              <div
                className={styles["landing-example-preview__board"]}
                role="list"
              >
                {PREVIEW_COLUMNS.map((columnKey) => (
                  <article
                    key={columnKey}
                    className={styles["landing-example-preview__column"]}
                    role="listitem"
                  >
                    <Title
                      variant="h4"
                      className={
                        styles["landing-example-preview__column-title"]
                      }
                    >
                      {tExamples(`columns.${columnKey}`)}
                    </Title>
                    <ul className={styles["landing-example-preview__items"]}>
                      {featurePreview.columns[columnKey].map((item) => (
                        <li
                          key={item}
                          className={styles["landing-example-preview__item"]}
                        >
                          <span
                            className={
                              styles["landing-example-preview__item-check"]
                            }
                            aria-hidden="true"
                          >
                            •
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </section>

        {/* Impact */}
        <section
          className={styles["impact-section"]}
          aria-labelledby={getAccessibilityId("landing-impact-title")}
        >
          <Title
            variant="h2"
            className={styles["section-title"]}
            id={getAccessibilityId("landing-impact-title")}
          >
            {tImpact("title")}
          </Title>
          <Text
            variant="body"
            className={styles["impact-section__description"]}
          >
            {tImpact("description")}
          </Text>
          <div className={styles["impact-grid"]} role="list">
            {IMPACT_KEYS.map((key) => (
              <article
                key={key}
                className={styles["impact-card"]}
                role="listitem"
              >
                <Text variant="metric">{tImpact(`${key}.value`)}</Text>
                <Title variant="h3">{tImpact(`${key}.title`)}</Title>
                <Text variant="body">{tImpact(`${key}.description`)}</Text>
              </article>
            ))}
          </div>
        </section>

        {/* Rhythm */}
        <section
          className={styles["rhythm-section"]}
          aria-labelledby={getAccessibilityId("landing-rhythm-title")}
        >
          <Title
            variant="h2"
            className={styles["section-title"]}
            id={getAccessibilityId("landing-rhythm-title")}
          >
            {tRhythm("title")}
          </Title>
          <div className={styles["rhythm-grid"]} role="list">
            {RHYTHM_KEYS.map((key, index) => (
              <article
                key={key}
                className={styles["rhythm-card"]}
                role="listitem"
              >
                <div className={styles["rhythm-card__header"]}>
                  <span className={styles["rhythm-card__step"]}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={styles["rhythm-card__icon"]}
                    aria-hidden="true"
                  >
                    {tRhythm(`${key}.icon`)}
                  </span>
                </div>
                <Title variant="h3">{tRhythm(`${key}.title`)}</Title>
                <Text variant="body">{tRhythm(`${key}.description`)}</Text>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className={styles["cta-section"]}
          aria-labelledby={getAccessibilityId("landing-cta-title")}
        >
          <Title
            variant="h2"
            className={styles["cta-section__title"]}
            id={getAccessibilityId("landing-cta-title")}
          >
            {tCta("title")}
          </Title>
          <Button
            label={tCta("button")}
            onClick={handleSignUp}
            aria-label={tCta("button")}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className={styles["landing-footer"]}>
        <nav
          className={styles["landing-footer__nav"]}
          aria-label={tFooter("ariaLabel")}
        >
          <Link
            href={legal}
            className={styles["landing-footer__link"]}
          >
            {tFooter("legal")}
          </Link>
          {isBillingVisible && (
            <Link
              href={pricing}
              className={styles["landing-footer__link"]}
            >
              {tFooter("pricing")}
            </Link>
          )}
        </nav>
      </footer>
    </main>
  );
};

const LandingPage = () => {
  return <LandingPageContent />;
};

export default LandingPage;
