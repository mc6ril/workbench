"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getAccessibilityId } from "@/shared/a11y";
import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/button";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { useToastStore } from "@/shared/stores/useToastStore";

import styles from "./styles.module.scss";

import type { PlanKey } from "@/domains/billing/constants/pricing";
import {
  FAQ_KEYS,
  FEATURE_ROWS,
  PLAN_KEYS,
} from "@/domains/billing/constants/pricing";
import {
  PLAN_RANK,
  SubscriptionPlan,
} from "@/domains/billing/core/domain/subscription.types";
import { useCreateBillingPortalSession } from "@/domains/billing/presentation/hooks/useCreateBillingPortalSession";
import { useCreateCheckoutSession } from "@/domains/billing/presentation/hooks/useCreateCheckoutSession";
import { useSubscription } from "@/domains/billing/presentation/hooks/useSubscription";
import { useSession } from "@/domains/session/presentation/hooks/useSession";

const PricingPage = () => {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { data: subscription } = useSubscription();
  const t = useTranslations("pages.pricing");
  const tCta = useTranslations("pages.pricing.cta");
  const tErrors = useTranslations("errors.stripe");
  const addToast = useToastStore((s) => s.addToast);
  const createCheckoutSessionMutation = useCreateCheckoutSession();
  const createBillingPortalSessionMutation = useCreateBillingPortalSession();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleGoBack = useCallback(() => {
    const from = searchParams.get("from");
    if (from) {
      router.push(from);
    } else {
      router.back();
    }
  }, [router, searchParams]);

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

  const handleCheckout = useCallback(
    async (plan: SubscriptionPlan) => {
      setCheckoutLoading(plan);
      try {
        const from = searchParams.get("from") ?? undefined;
        const { url } = await createCheckoutSessionMutation.mutateAsync({
          plan,
          from,
        });
        window.location.href = url;
      } catch {
        addToast({
          message: tErrors("checkoutFailed"),
          variant: "error",
          duration: 6000,
        });
      } finally {
        setCheckoutLoading(null);
      }
    },
    [addToast, createCheckoutSessionMutation, searchParams, tErrors]
  );

  const handleManageBilling = useCallback(async () => {
    setCheckoutLoading("portal");
    try {
      const { url } = await createBillingPortalSessionMutation.mutateAsync({});
      window.location.href = url;
    } catch {
      addToast({
        message: tErrors("portalFailed"),
        variant: "error",
        duration: 6000,
      });
    } finally {
      setCheckoutLoading(null);
    }
  }, [addToast, createBillingPortalSessionMutation, tErrors]);

  const getCtaProps = useCallback(
    (
      planKey: PlanKey
    ): {
      label: string;
      variant: "primary" | "secondary";
      disabled: boolean;
      onClick: () => void;
    } => {
      const currentPlan = subscription?.plan ?? SubscriptionPlan.FREE;
      const planName = t(`plans.${planKey}.name`);

      if (!session) {
        return {
          label: tCta("signUpFirst"),
          variant: planKey === "pro" ? "primary" : "secondary",
          disabled: false,
          onClick: () => router.push(AUTH_PAGE_ROUTES.SIGNUP),
        };
      }

      if (planKey === currentPlan) {
        return {
          label: tCta("currentPlan"),
          variant: "secondary",
          disabled: true,
          onClick: () => {},
        };
      }

      const cardRank = PLAN_RANK[planKey] ?? 0;
      const currentRank = PLAN_RANK[currentPlan] ?? 0;

      if (cardRank > currentRank) {
        const hasExistingSubscription = currentRank > 0;

        return {
          label: tCta("upgrade").replace("{plan}", planName),
          variant: "primary",
          disabled: checkoutLoading !== null,
          onClick: hasExistingSubscription
            ? handleManageBilling
            : () => handleCheckout(planKey as SubscriptionPlan),
        };
      }

      if (planKey === "free") {
        return {
          label: tCta("downgradeFree"),
          variant: "secondary",
          disabled: checkoutLoading !== null,
          onClick: handleManageBilling,
        };
      }

      return {
        label: tCta("downgrade").replace("{plan}", planName),
        variant: "secondary",
        disabled: checkoutLoading !== null,
        onClick: handleManageBilling,
      };
    },
    [
      session,
      subscription,
      t,
      tCta,
      router,
      checkoutLoading,
      handleCheckout,
      handleManageBilling,
    ]
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
            <Title variant="h1" className={styles["pricing-welcome__title"]}>
              {t("header.title")}
            </Title>
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
            const currentPlan = subscription?.plan ?? SubscriptionPlan.FREE;
            const isCurrent = !!session && plan === currentPlan;

            return (
              <div
                key={plan}
                className={`${styles["pricing-card"]} ${isPopular ? styles["pricing-card--popular"] : ""} ${isCurrent ? styles["pricing-card--current"] : ""}`}
                role="listitem"
              >
                {isPopular && !isCurrent && (
                  <div className={styles["pricing-card__badge"]}>
                    {t(`plans.${plan}.badge`)}
                  </div>
                )}
                {isCurrent && (
                  <div
                    className={`${styles["pricing-card__badge"]} ${styles["pricing-card__badge--current"]}`}
                  >
                    {t("plans.currentBadge")}
                  </div>
                )}

                <div className={styles["pricing-card__header"]}>
                  <Title variant="h2" className={styles["pricing-card__name"]}>
                    {t(`plans.${plan}.name`)}
                  </Title>
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

                {(() => {
                  const cta = getCtaProps(plan);
                  return (
                    <Button
                      label={cta.label}
                      variant={cta.variant}
                      fullWidth
                      disabled={cta.disabled}
                      onClick={cta.onClick}
                      aria-label={cta.label}
                    />
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <section
          className={styles["comparison-section"]}
          aria-labelledby={getAccessibilityId("pricing-comparison-title")}
        >
          <Title
            variant="h2"
            id={getAccessibilityId("pricing-comparison-title")}
            className="visually-hidden"
          >
            {t("comparison.title")}
          </Title>
          <div className={styles["comparison-table-wrapper"]}>
            <table
              className={styles["comparison-table"]}
              aria-label={t("comparison.title")}
            >
              <thead>
                <tr>
                  <th className={styles["comparison-table__feature-header"]}>
                    {t("comparison.featuresColumn")}
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
          <Title variant="h3" className={styles["guarantee__title"]}>
            {t("guarantee.title")}
          </Title>
          <Text variant="small">{t("guarantee.description")}</Text>
        </div>

        <section
          className={styles["pricing-trust-section"]}
          aria-labelledby={getAccessibilityId("pricing-trust-title")}
        >
          <Title
            variant="h2"
            id={getAccessibilityId("pricing-trust-title")}
            className={styles["pricing-trust-section__title"]}
          >
            {t("trust.title")}
          </Title>
          <div className={styles["pricing-trust-list"]} role="list">
            <span className={styles["pricing-trust-item"]} role="listitem">
              {t("trust.item1")}
            </span>
            <span className={styles["pricing-trust-item"]} role="listitem">
              {t("trust.item2")}
            </span>
            <span className={styles["pricing-trust-item"]} role="listitem">
              {t("trust.item3")}
            </span>
          </div>
        </section>

        {/* FAQ */}
        <section
          className={styles["faq-section"]}
          aria-labelledby={getAccessibilityId("pricing-faq-title")}
        >
          <Title
            variant="h2"
            id={getAccessibilityId("pricing-faq-title")}
            className={styles["faq-title"]}
          >
            {t("faq.title")}
          </Title>

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
