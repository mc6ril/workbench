"use client";

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useVerifyEmail } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";

import styles from "./VerifyEmailPage.module.scss";

const VerifyEmailPage = () => {
  const tCommon = useTranslation("common");

  return (
    <Suspense
      fallback={
        <div className={styles["verify-email-page"]}>
          <div className={styles["verify-email-container"]}>
            <p>{tCommon("loading")}</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
};

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyEmailMutation = useVerifyEmail();
  const t = useTranslation("pages.verifyEmail");
  const tCommon = useTranslation("common");

  // Extract token and email from URL parameters using useMemo to avoid unnecessary re-renders
  const { token, email, isValid } = useMemo(() => {
    const tokenParam = searchParams.get("token");
    const typeParam = searchParams.get("type");
    const emailParam = searchParams.get("email");

    // Only proceed if type is 'email' (email verification)
    const isValidType = typeParam === "email" && tokenParam && emailParam;

    return {
      token: isValidType ? tokenParam : null,
      email: isValidType ? emailParam : null,
      isValid: isValidType,
    };
  }, [searchParams]);

  // Trigger verification when token and email are available
  useEffect(() => {
    if (
      isValid &&
      token &&
      email &&
      !verifyEmailMutation.isPending &&
      !verifyEmailMutation.isSuccess &&
      !verifyEmailMutation.isError
    ) {
      verifyEmailMutation.mutate({
        email,
        token,
      });
    }
  }, [isValid, token, email, verifyEmailMutation]);

  // Redirect to workspace after successful verification
  useEffect(() => {
    if (verifyEmailMutation.isSuccess && verifyEmailMutation.data?.session) {
      // Auto-login successful, redirect to workspace
      router.push("/myworkspace");
    }
  }, [verifyEmailMutation.isSuccess, verifyEmailMutation.data, router]);

  // Memoize error messages to avoid recreating them on every render
  const errorMessages = useMemo(
    () => ({
      invalidToken: t("errors.invalidToken"),
      verificationError: t("errors.verificationError"),
      generic: t("errors.generic"),
    }),
    [t]
  );

  // Determine error message using useMemo for performance
  const errorMessage = useMemo((): string | null => {
    if (!verifyEmailMutation.error) {
      return null;
    }

    const error = verifyEmailMutation.error as {
      message?: string;
      code?: string;
    };

    if (error.code === "INVALID_TOKEN") {
      return errorMessages.invalidToken;
    }

    if (error.code === "EMAIL_VERIFICATION_ERROR") {
      return errorMessages.verificationError;
    }

    return error.message || errorMessages.generic;
  }, [verifyEmailMutation.error, errorMessages]);

  // Show error if token/email are missing
  if (!token || !email) {
    return (
      <div className={styles["verify-email-page"]}>
        <div className={styles["verify-email-container"]}>
          <h1 className={styles["verify-email-title"]}>{t("title")}</h1>
          <div className={styles["verify-email-error"]} role="alert">
            {t("errors.missingToken")}
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
        <h1 className={styles["verify-email-title"]}>{t("title")}</h1>

        {verifyEmailMutation.isPending && (
          <div
            className={styles["verify-email-loading"]}
            role="status"
            aria-live="polite"
          >
            <p>{tCommon("loading")}</p>
          </div>
        )}

        {errorMessage && (
          <div className={styles["verify-email-error"]} role="alert">
            {errorMessage}
          </div>
        )}

        {verifyEmailMutation.isSuccess && verifyEmailMutation.data?.session && (
          <div
            className={styles["verify-email-success"]}
            role="status"
            aria-live="polite"
          >
            <p>{t("success")}</p>
            <p>{t("redirecting")}</p>
          </div>
        )}

        {errorMessage && (
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

export default VerifyEmailPage;
