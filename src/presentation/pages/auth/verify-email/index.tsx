"use client";

import { Suspense } from "react";
import Link from "next/link";

import {
  ErrorMessage,
  Loader,
  Text,
  Title,
} from "@/presentation/components/ui";
import { useVerifyEmailFlow } from "@/presentation/hooks/auth/useVerifyEmailFlow";

import { useTranslation } from "@/shared/i18n";

import styles from "./styles.module.scss";

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
            <Link href="/auth/signin" className={styles["verify-email-link"]}>
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
            <Link href="/auth/signin" className={styles["verify-email-link"]}>
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
