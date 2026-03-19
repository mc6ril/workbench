"use client";

import type { MouseEvent } from "react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y";
import {
  FEATURE_KEYS,
  HERO_PROOF_KEYS,
  IMPACT_KEYS,
  PREVIEW_COLUMNS,
  RHYTHM_KEYS,
  TRUST_ITEM_KEYS,
  VALUE_KEYS,
} from "@/shared/constants/landing";
import type { FeatureKey } from "@/shared/constants/landing.types";
import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/button";
import Text from "@/shared/design-system/text";
import { useTranslation } from "@/shared/i18n";
import { buildFeaturePreviewContent, isFeatureKey } from "@/shared/utils";

import styles from "./styles.module.scss";

const LandingPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tHero = useTranslation("pages.landing.hero");
  const tValues = useTranslation("pages.landing.values");
  const tFeatures = useTranslation("pages.landing.features");
  const tExamples = useTranslation("pages.landing.examples");
  const tImpact = useTranslation("pages.landing.impact");
  const tRhythm = useTranslation("pages.landing.rhythm");
  const tTrust = useTranslation("pages.landing.trust");
  const tCta = useTranslation("pages.landing.cta");
  const tFooter = useTranslation("pages.landing.footer");
  const [selectedFeatureKey, setSelectedFeatureKey] = useState<FeatureKey>(
    "board"
  );

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
        router.replace(
          `${AUTH_PAGE_ROUTES.UPDATE_PASSWORD}?${params.toString()}`
        );
      } else {
        router.replace(
          `${AUTH_PAGE_ROUTES.VERIFY_EMAIL}?code=${encodeURIComponent(code)}`
        );
      }
    }
  }, [searchParams, router]);

  const handleSignUp = useCallback(() => {
    router.push(AUTH_PAGE_ROUTES.SIGNUP);
  }, [router]);

  const handleSignIn = useCallback(() => {
    router.push(AUTH_PAGE_ROUTES.SIGNIN);
  }, [router]);

  const handleScrollToPreview = useCallback(() => {
    const target = document.getElementById(getAccessibilityId("landing-example-preview"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleFeatureSelect = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const nextFeatureKey = event.currentTarget.dataset.featureKey;
      if (nextFeatureKey && isFeatureKey(nextFeatureKey)) {
        setSelectedFeatureKey(nextFeatureKey);
      }
    },
    []
  );

  const selectedFeaturePreview = useMemo(() => {
    return buildFeaturePreviewContent(selectedFeatureKey, tExamples);
  }, [selectedFeatureKey, tExamples]);

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
            <span className={styles["landing-hero__brand-mark"]} aria-hidden="true">
              TN
            </span>
            <span className={styles["landing-hero__brand-name"]}>Tribu Nova</span>
          </div>
          <span className={styles["landing-hero__pill"]}>
            {tHero("brandPill")}
          </span>
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
                <span className={styles["value-card__icon"]} aria-hidden="true">
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
                className={[
                  styles["feature-card"],
                  selectedFeatureKey === key
                    ? styles["feature-card--active"]
                    : "",
                ].join(" ")}
                role="listitem"
              >
                <button
                  type="button"
                  className={styles["feature-card__button"]}
                  data-feature-key={key}
                  onClick={handleFeatureSelect}
                  aria-pressed={selectedFeatureKey === key}
                  aria-controls={getAccessibilityId("landing-example-preview")}
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
                </button>
              </article>
            ))}
          </div>
          <section
            id={getAccessibilityId("landing-example-preview")}
            className={styles["landing-example-preview"]}
            aria-labelledby={getAccessibilityId(
              "landing-example-preview-title"
            )}
          >
            <h3
              id={getAccessibilityId("landing-example-preview-title")}
              className={styles["landing-example-preview__title"]}
            >
              {tExamples("title")}
            </h3>
            <Text
              variant="body"
              className={styles["landing-example-preview__description"]}
            >
              {selectedFeaturePreview.title} -{" "}
              {selectedFeaturePreview.description}
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
                    <h4
                      className={styles["landing-example-preview__column-title"]}
                    >
                      {tExamples(`columns.${columnKey}`)}
                    </h4>
                    <ul className={styles["landing-example-preview__items"]}>
                      {selectedFeaturePreview.columns[columnKey].map((item) => (
                        <li
                          key={item}
                          className={styles["landing-example-preview__item"]}
                        >
                          <span
                            className={styles["landing-example-preview__item-check"]}
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
          <h2
            className={styles["section-title"]}
            id={getAccessibilityId("landing-impact-title")}
          >
            {tImpact("title")}
          </h2>
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
                <p className={styles["impact-card__metric"]}>
                  {tImpact(`${key}.value`)}
                </p>
                <h3 className={styles["impact-card__title"]}>
                  {tImpact(`${key}.title`)}
                </h3>
                <Text
                  variant="body"
                  className={styles["impact-card__description"]}
                >
                  {tImpact(`${key}.description`)}
                </Text>
              </article>
            ))}
          </div>
        </section>

        {/* Rhythm */}
        <section
          className={styles["rhythm-section"]}
          aria-labelledby={getAccessibilityId("landing-rhythm-title")}
        >
          <h2
            className={styles["section-title"]}
            id={getAccessibilityId("landing-rhythm-title")}
          >
            {tRhythm("title")}
          </h2>
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
                <h3 className={styles["rhythm-card__title"]}>
                  {tRhythm(`${key}.title`)}
                </h3>
                <Text
                  variant="body"
                  className={styles["rhythm-card__description"]}
                >
                  {tRhythm(`${key}.description`)}
                </Text>
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
          <Text variant="body" className={styles["trust-section__description"]}>
            {tTrust("description")}
          </Text>
          <div className={styles["trust-badges"]} role="list">
            {TRUST_ITEM_KEYS.map(({ iconKey, labelKey }) => (
              <span key={labelKey} className={styles["trust-badge"]} role="listitem">
                <span className={styles["trust-badge__icon"]} aria-hidden="true">
                  {tTrust(iconKey)}
                </span>
                {tTrust(labelKey)}
              </span>
            ))}
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
          <Text variant="body" className={styles["cta-section__description"]}>
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
        <nav
          className={styles["landing-footer__nav"]}
          aria-label={tFooter("ariaLabel")}
        >
          <Link href={PAGE_ROUTES.LEGAL} className={styles["landing-footer__link"]}>
            {tFooter("legal")}
          </Link>
          <Link
            href={PAGE_ROUTES.PRICING}
            className={styles["landing-footer__link"]}
          >
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
