"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useSearchParams } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import BackButton from "@/shared/design-system/back_button";
import Loader from "@/shared/design-system/loader";
import Title from "@/shared/design-system/title";
import { useTranslations } from "@/shared/i18n";
import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { useToastStore } from "@/shared/stores/useToastStore";

import styles from "./styles.module.scss";

import { useSession } from "@/domains/session/presentation/hooks/useSession";
import AccountBillingAndActionsSection from "@/domains/settings/presentation/components/AccountBillingAndActionsSection";
import AccountPersonalInfoSection from "@/domains/settings/presentation/components/AccountPersonalInfoSection";
import AccountPreferencesSection from "@/domains/settings/presentation/components/AccountPreferencesSection";
import AccountSecuritySection from "@/domains/settings/presentation/components/AccountSecuritySection";
import { useViewer } from "@/domains/viewer/presentation/hooks/useViewer";

const AccountPageClient = () => {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const addToast = useToastStore((s) => s.addToast);
  const tStripe = useTranslations("errors.stripe");
  const t = useTranslations("pages.account");

  const { data: session, isLoading: isSessionLoading } = useSession();
  const { isLoading: isViewerLoading } = useViewer();

  const checkoutHandled = useRef(false);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (
      searchParams.get("checkout") === "success" &&
      !checkoutHandled.current
    ) {
      checkoutHandled.current = true;
      addToast({
        message: tStripe("checkoutSuccess"),
        variant: "success",
        duration: 6000,
      });
      router.replace(PAGE_ROUTES.ACCOUNT, {
        scroll: false,
        feedback: "none",
      });
    }
  }, [addToast, router, searchParams, tStripe]);

  const goBackHref = useMemo(() => {
    const from = searchParams.get("from");
    if (from && from.startsWith(PAGE_ROUTES.HOME)) {
      return from;
    }
    return PAGE_ROUTES.WORKSPACE;
  }, [searchParams]);

  const onGoToPricing = useCallback(
    (pricingHref: string) => {
      router.push(pricingHref);
    },
    [router]
  );

  const isPageLoading =
    isSessionLoading || (session?.userId && isViewerLoading);
  const shouldShowLoader = !isMounted || isPageLoading;

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
            <AccountBillingAndActionsSection onGoToPricing={onGoToPricing} />
          </>
        )}
      </div>
    </main>
  );
};

export default React.memo(AccountPageClient);
