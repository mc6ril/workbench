"use client";

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Loader from "@/presentation/components/ui/Loader";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";
import { useVerifyEmail } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import styles from "./VerifyEmailPage.module.scss";

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

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyEmailMutation = useVerifyEmail();
  const t = useTranslation("pages.verifyEmail");
  const tErrors = useTranslation("errors");

  // Extract token/code and email from URL parameters using useMemo to avoid unnecessary re-renders
  // Supabase can redirect with either:
  // 1. token + type + email (standard format)
  // 2. code (exchange code format, used when redirecting to root)
  const { token, email, isValid } = useMemo(() => {
    const tokenParam = searchParams.get("token");
    const codeParam = searchParams.get("code");
    const typeParam = searchParams.get("type");
    const emailParam = searchParams.get("email");

    // Use code as token if token is not available (Supabase redirects with code to root)
    const actualToken = tokenParam || codeParam;

    // For token format, we need type='email' and email parameter
    const isValidTokenFormat =
      typeParam === "email" && actualToken && emailParam;

    // For code format, validate that type is either missing or "email"
    // Reject codes with type="recovery" or other types to prevent misuse
    const isValidCodeFormat =
      codeParam !== null && (typeParam === null || typeParam === "email"); // No type or type must be "email"

    return {
      token: actualToken,
      email: emailParam || null, // Email may be null for code format
      isValid: isValidTokenFormat || isValidCodeFormat,
    };
  }, [searchParams]);

  // Trigger verification when token is available
  // Email is optional (code format doesn't require email in URL)
  useEffect(() => {
    if (
      isValid &&
      token &&
      !verifyEmailMutation.isPending &&
      !verifyEmailMutation.isSuccess &&
      !verifyEmailMutation.isError
    ) {
      verifyEmailMutation.mutate({
        email: email || "", // Empty string if email not provided (code format)
        token,
      });
    }
  }, [isValid, token, email, verifyEmailMutation]);

  // Redirect to workspace after successful verification
  useEffect(() => {
    if (verifyEmailMutation.isSuccess && verifyEmailMutation.data?.session) {
      // Auto-login successful, redirect to workspace
      router.push("/workspace");
    }
  }, [verifyEmailMutation.isSuccess, verifyEmailMutation.data, router]);

  // Determine error message using useMemo for performance
  const errorMessage = useMemo((): string | null => {
    if (!verifyEmailMutation.error) {
      return null;
    }

    const error = verifyEmailMutation.error as { code?: string };
    return getErrorMessage(error, tErrors);
  }, [verifyEmailMutation.error, tErrors]);

  // Show error if token is missing
  // Email is optional (code format doesn't require email)
  if (!token) {
    return (
      <div className={styles["verify-email-page"]}>
        <div className={styles["verify-email-container"]}>
          <Title variant="h1" className={styles["verify-email-title"]}>
            {t("title")}
          </Title>
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
        <Title variant="h1" className={styles["verify-email-title"]}>
          {t("title")}
        </Title>

        {verifyEmailMutation.isPending && <Loader variant="inline" />}

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
            <Text variant="body">{t("success")}</Text>
            <Text variant="body">{t("redirecting")}</Text>
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
