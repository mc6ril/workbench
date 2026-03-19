"use client";

import { Suspense } from "react";
import Link from "next/link";

import { AUTH_PAGE_ROUTES } from "@/shared/constants/routes";
import ErrorMessage from "@/shared/design-system/error_message";
import Loader from "@/shared/design-system/loader";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

import { useVerifyEmailFlow } from "@/domains/auth/presentation/hooks/verification/useVerifyEmailFlow";

const VerifyEmailContent = () => {
  const t = useTranslation("pages.verifyEmail");

  const { isMissingToken, isPending, isSuccess, isError, errorMessage } =
    useVerifyEmailFlow();

  if (isMissingToken) {
    return (
      <div className={styles["verify-email-page"]}>
        <div className={styles["verify-email-container"]}>
          <Title variant="h1" className={styles["verify-email-title"]}>
            {t("title")}
          </Title>
          <div className={styles["verify-email-error"]}>
            <ErrorMessage
              message={t("errors.missingToken")}
              aria-label={t("errors.missingToken")}
            />
          </div>
          <div className={styles["verify-email-footer"]}>
            <Link
              href={AUTH_PAGE_ROUTES.SIGNIN}
              className={styles["verify-email-link"]}
            >
              {t("backToSignin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["verify-email-page"]}>
      <div className={styles["verify-email-container"]}>
        <Title variant="h1" className={styles["verify-email-title"]}>
          {t("title")}
        </Title>

        {isPending && <Loader variant="inline" />}

        {isError && errorMessage && (
          <div className={styles["verify-email-error"]}>
            <ErrorMessage message={errorMessage} />
          </div>
        )}

        {isSuccess && (
          <div
            className={styles["verify-email-success"]}
            role="status"
            aria-live="polite"
          >
            <Text variant="body">{t("success")}</Text>
            <Text variant="body">{t("redirecting")}</Text>
          </div>
        )}

        {isError && (
          <div className={styles["verify-email-footer"]}>
            <Link
              href={AUTH_PAGE_ROUTES.SIGNIN}
              className={styles["verify-email-link"]}
            >
              {t("backToSignin")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const VerifyEmailPage = () => {
  return (
    <Suspense
      fallback={
        <div className={styles["verify-email-page"]}>
          <Loader variant="inline" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;
