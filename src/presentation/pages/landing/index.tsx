import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { getAccessibilityId } from "@/shared/a11y";
import { PRODUCT_BRAND_NAME } from "@/shared/constants/brand";
import {
  HERO_PROOF_KEYS,
  IMPACT_KEYS,
  PREVIEW_COLUMNS,
  RHYTHM_KEYS,
  VALUE_KEYS,
} from "@/shared/constants/landing";
import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import type { Locale } from "@/shared/i18n/config";
import {
  buildMarketingLegalPath,
  buildMarketingPricingPath,
} from "@/shared/i18n/marketingPaths";
import { buildFeaturePreviewContent } from "@/shared/utils";

import styles from "./styles.module.scss";

type LandingPageProps = {
  locale: Locale;
  isBillingVisible: boolean;
};

const createNamespaceTranslationGetter = async (
  locale: Locale,
  namespace: string
) => {
  const t = await getTranslations({ locale, namespace });
  return (key: string): string => t(key);
};

const getCtaClassName = (...classNames: Array<string | undefined>) => {
  return classNames.filter(Boolean).join(" ");
};

const LandingPage = async ({ locale, isBillingVisible }: LandingPageProps) => {
  const [
    tHero,
    tValues,
    tFeatures,
    tExamples,
    tImpact,
    tRhythm,
    tCta,
    tFooter,
  ] = await Promise.all([
    createNamespaceTranslationGetter(locale, "pages.landing.hero"),
    createNamespaceTranslationGetter(locale, "pages.landing.values"),
    createNamespaceTranslationGetter(locale, "pages.landing.features"),
    createNamespaceTranslationGetter(locale, "pages.landing.examples"),
    createNamespaceTranslationGetter(locale, "pages.landing.impact"),
    createNamespaceTranslationGetter(locale, "pages.landing.rhythm"),
    createNamespaceTranslationGetter(locale, "pages.landing.cta"),
    createNamespaceTranslationGetter(locale, "pages.landing.footer"),
  ]);

  const legal = buildMarketingLegalPath(locale);
  const pricing = buildMarketingPricingPath(locale);
  const featurePreview = buildFeaturePreviewContent("board", tExamples);
  const previewAnchor = `#${getAccessibilityId("landing-example-preview")}`;
  const primaryCtaClassName = getCtaClassName(
    styles["landing-hero__cta"],
    styles["landing-hero__ctaPrimary"]
  );
  const ghostCtaClassName = getCtaClassName(
    styles["landing-hero__cta"],
    styles["landing-hero__ctaGhost"]
  );
  const secondaryCtaClassName = getCtaClassName(
    styles["landing-hero__cta"],
    styles["landing-hero__ctaSecondary"]
  );

  return (
    <main className={styles["landing-page"]}>
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
              {PRODUCT_BRAND_NAME}
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
            <Link
              href={AUTH_PAGE_ROUTES.SIGNUP}
              className={primaryCtaClassName}
              aria-label={tHero("ctaSignUp")}
            >
              {tHero("ctaSignUp")}
            </Link>
            <Link
              href={AUTH_PAGE_ROUTES.SIGNIN}
              className={ghostCtaClassName}
              aria-label={tHero("ctaSignIn")}
            >
              {tHero("ctaSignIn")}
            </Link>
            <Link
              href={previewAnchor}
              className={secondaryCtaClassName}
              aria-label={tHero("ctaPreview")}
            >
              {tHero("ctaPreview")}
            </Link>
          </div>
        </div>
      </header>

      <div className={styles["landing-container"]}>
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
                  {PRODUCT_BRAND_NAME}
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
                <Text
                  variant="metric"
                  className={styles["impact-card__metric"]}
                >
                  {tImpact(`${key}.value`)}
                </Text>
                <Title variant="h3">{tImpact(`${key}.title`)}</Title>
                <Text variant="body">{tImpact(`${key}.description`)}</Text>
              </article>
            ))}
          </div>
        </section>

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
          <Link
            href={AUTH_PAGE_ROUTES.SIGNUP}
            className={getCtaClassName(
              primaryCtaClassName,
              styles["cta-section__button"]
            )}
            aria-label={tCta("button")}
          >
            {tCta("button")}
          </Link>
        </section>
      </div>

      <footer className={styles["landing-footer"]}>
        <nav
          className={styles["landing-footer__nav"]}
          aria-label={tFooter("ariaLabel")}
        >
          <Link href={legal} className={styles["landing-footer__link"]}>
            {tFooter("legal")}
          </Link>
          {isBillingVisible && (
            <Link href={pricing} className={styles["landing-footer__link"]}>
              {tFooter("pricing")}
            </Link>
          )}
        </nav>
      </footer>
    </main>
  );
};

export default LandingPage;
