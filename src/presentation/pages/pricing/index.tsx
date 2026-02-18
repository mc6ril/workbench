"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Text } from "@/presentation/components/ui";

import { getAccessibilityId } from "@/shared/a11y";
import { FAQ_KEYS, FEATURE_ROWS, PLAN_KEYS } from "@/shared/constants";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

const PricingPage = () => {
  const router = useRouter();
  const t = useTranslation("pages.pricing");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const toggleFaq = useCallback(
    (index: number) => {
      setOpenFaqIndex(openFaqIndex === index ? null : index);
    },
    [openFaqIndex]
  );

  const handleFaqKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFaq(index);
      }
    },
    [toggleFaq]
  );

  const renderFeatureValue = (valueKey: string): React.ReactNode => {
    const value = t(`values.${valueKey}`);
    const isIncluded = valueKey === "included";
    const isNotIncluded = valueKey === "notIncluded";

    if (isIncluded) {
      return (
        <span className={styles["feature-check"]} aria-label={value}>
          ✓
        </span>
      );
    }

    if (isNotIncluded) {
      return (
        <span className={styles["feature-dash"]} aria-label={value}>
          —
        </span>
      );
    }

    return <span>{value}</span>;
  };

  return (
    <main className={styles["pricing-page"]}>
      <header className={styles["pricing-header"]}>
        <div className={styles["pricing-header__content"]}>
          <button
            type="button"
            className={styles["back-link"]}
            aria-label={t("header.label")}
            onClick={handleGoBack}
          >
            ← {t("header.label")}
          </button>
          <div className={styles["pricing-welcome"]}>
            <h1 className={styles["pricing-welcome__title"]}>
              {t("header.title")}
            </h1>
            <p className={styles["pricing-welcome__subtitle"]}>
              {t("header.subtitle")}
            </p>
          </div>
        </div>
      </header>

      <div className={styles["pricing-container"]}>
        {/* Pricing Cards */}
        <div
          className={styles["pricing-grid"]}
          role="list"
          aria-label={t("header.title")}
        >
          {PLAN_KEYS.map((plan) => {
            const isPopular = plan === "pro";

            return (
              <div
                key={plan}
                className={`${styles["pricing-card"]} ${isPopular ? styles["pricing-card--popular"] : ""}`}
                role="listitem"
              >
                {isPopular && (
                  <div className={styles["pricing-card__badge"]}>
                    {t(`plans.${plan}.badge`)}
                  </div>
                )}

                <div className={styles["pricing-card__header"]}>
                  <h2 className={styles["pricing-card__name"]}>
                    {t(`plans.${plan}.name`)}
                  </h2>
                  <p className={styles["pricing-card__description"]}>
                    {t(`plans.${plan}.description`)}
                  </p>
                </div>

                <div className={styles["pricing-card__price"]}>
                  <span className={styles["pricing-card__amount"]}>
                    {t(`plans.${plan}.price`)}
                  </span>
                  {plan !== "free" && (
                    <span className={styles["pricing-card__period"]}>
                      {t("billing.perMonth")}
                    </span>
                  )}
                </div>

                <Button
                  label={t(`plans.${plan}.cta`)}
                  variant={isPopular ? "primary" : "secondary"}
                  fullWidth
                  aria-label={t(`plans.${plan}.ctaAriaLabel`)}
                />
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <section
          className={styles["comparison-section"]}
          aria-labelledby={getAccessibilityId("pricing-comparison-title")}
        >
          <h2
            id={getAccessibilityId("pricing-comparison-title")}
            className="visually-hidden"
          >
            {t("comparison.title")}
          </h2>
          <div className={styles["comparison-table-wrapper"]}>
            <table
              className={styles["comparison-table"]}
              aria-label={t("comparison.title")}
            >
              <thead>
                <tr>
                  <th className={styles["comparison-table__feature-header"]}>
                    {t("features.workspaces").split(" ")[0]}
                  </th>
                  {PLAN_KEYS.map((plan) => (
                    <th
                      key={plan}
                      className={`${styles["comparison-table__plan-header"]} ${plan === "pro" ? styles["comparison-table__plan-header--popular"] : ""}`}
                    >
                      {t(`plans.${plan}.name`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row) => (
                  <tr key={row.key}>
                    <td className={styles["comparison-table__feature-name"]}>
                      {t(`features.${row.key}`)}
                    </td>
                    <td className={styles["comparison-table__value"]}>
                      {renderFeatureValue(row.free)}
                    </td>
                    <td
                      className={`${styles["comparison-table__value"]} ${styles["comparison-table__value--popular"]}`}
                    >
                      {renderFeatureValue(row.pro)}
                    </td>
                    <td className={styles["comparison-table__value"]}>
                      {renderFeatureValue(row.team)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Guarantee */}
        <div className={styles["guarantee"]}>
          <div className={styles["guarantee__icon"]} aria-hidden="true">
            🛡️
          </div>
          <h3 className={styles["guarantee__title"]}>
            {t("guarantee.title")}
          </h3>
          <Text variant="small">{t("guarantee.description")}</Text>
        </div>

        {/* FAQ */}
        <section
          className={styles["faq-section"]}
          aria-labelledby={getAccessibilityId("pricing-faq-title")}
        >
          <h2
            id={getAccessibilityId("pricing-faq-title")}
            className={styles["faq-title"]}
          >
            {t("faq.title")}
          </h2>

          <div className={styles["faq-list"]}>
            {FAQ_KEYS.map((faqKey, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={faqKey}
                  className={`${styles["faq-item"]} ${isOpen ? styles["faq-item--open"] : ""}`}
                >
                  <button
                    type="button"
                    id={`faq-question-${faqKey}`}
                    className={styles["faq-item__question"]}
                    onClick={() => toggleFaq(index)}
                    onKeyDown={(e) => handleFaqKeyDown(e, index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faqKey}`}
                  >
                    <span>{t(`faq.items.${faqKey}.question`)}</span>
                    <span
                      className={styles["faq-item__chevron"]}
                      aria-hidden="true"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-answer-${faqKey}`}
                      className={styles["faq-item__answer"]}
                      role="region"
                      aria-labelledby={`faq-question-${faqKey}`}
                    >
                      <Text variant="small">
                        {t(`faq.items.${faqKey}.answer`)}
                      </Text>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

export default PricingPage;
