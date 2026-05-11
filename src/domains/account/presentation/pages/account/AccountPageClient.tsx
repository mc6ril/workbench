"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import BackButton from "@/shared/design-system/back_button";
import Loader from "@/shared/design-system/loader";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";

import styles from "./styles.module.scss";

import AccountBillingAndActionsSection from "@/domains/account/presentation/components/AccountBillingAndActionsSection";
import AccountPersonalInfoSection from "@/domains/account/presentation/components/AccountPersonalInfoSection";
import AccountPreferencesSection from "@/domains/account/presentation/components/AccountPreferencesSection";
import AccountSecuritySection from "@/domains/account/presentation/components/AccountSecuritySection";
import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";

const AccountPageClient = () => {
  const searchParams = useSearchParams();
  const t = useTranslations("pages.account");

  const { isLoading: isIdentityLoading } = useAuthIdentity();

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const goBackHref = useMemo(() => {
    if (!isMounted) {
      return PAGE_ROUTES.WORKSPACE;
    }
    const from = searchParams.get("from");
    if (from && from.startsWith(PAGE_ROUTES.HOME)) {
      return from;
    }
    return PAGE_ROUTES.WORKSPACE;
  }, [isMounted, searchParams]);

  const shouldShowLoader = !isMounted || isIdentityLoading;

  return (
    <main className={styles["account-page"]}>
      <header className={styles["account-header"]}>
        <div className={styles["account-header__content"]}>
          <BackButton
            label={t("header.label")}
            ariaLabel={t("header.label")}
            fallbackHref={goBackHref}
          />
          <div className={styles["account-welcome"]}>
            <Title variant="h1" className={styles["account-welcome__title"]}>
              {t("header.title")}
            </Title>
            <p className={styles["account-welcome__subtitle"]}>
              {t("header.subtitle")}
            </p>
          </div>
        </div>
      </header>
      <div className={styles["account-container"]}>
        {shouldShowLoader ? (
          <Loader variant="full-page" />
        ) : (
          <>
            <AccountPersonalInfoSection />
            <AccountSecuritySection />
            <AccountPreferencesSection />
            <AccountBillingAndActionsSection />
          </>
        )}
      </div>
    </main>
  );
};

export default React.memo(AccountPageClient);
