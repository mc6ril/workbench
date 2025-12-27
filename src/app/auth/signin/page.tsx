"use client";

import { useEffect, useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { SignInInput } from "@/core/domain/auth.schema";
import { SignInSchema } from "@/core/domain/auth.schema";

import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import { useResendVerification, useSignIn } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";

import styles from "./SigninPage.module.scss";

type FormData = SignInInput;

const SigninPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signInMutation = useSignIn();
  const resendVerificationMutation = useResendVerification();
  const t = useTranslation("pages.signin");
  const tCommon = useTranslation("common");

  // Check if redirected from middleware due to unverified email
  const isUnverifiedRedirect = searchParams.get("unverified") === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(SignInSchema),
    mode: "onBlur",
  });

  // Memoize error messages to avoid recreating them on every render
  const errorMessages = useMemo(
    () => ({
      invalidCredentials: t("errors.invalidCredentials"),
      invalidEmail: t("errors.invalidEmail"),
      emailNotVerified: t("errors.emailNotVerified"),
      generic: t("errors.generic"),
    }),
    [t]
  );

  // Show unverified email error if redirected from middleware
  useEffect(() => {
    if (isUnverifiedRedirect) {
      setError("root", {
        type: "server",
        message: errorMessages.emailNotVerified,
      });
    }
  }, [isUnverifiedRedirect, setError, errorMessages]);

  useEffect(() => {
    if (signInMutation.error) {
      const error = signInMutation.error as { message?: string; code?: string };

      // Map domain errors to form fields
      if (error.code === "EMAIL_VERIFICATION_ERROR") {
        // Unverified user trying to sign in
        setError("root", {
          type: "server",
          message: error.message || errorMessages.emailNotVerified,
        });
      } else if (error.code === "INVALID_CREDENTIALS") {
        // Invalid credentials can be either email or password issue
        // Set on root to show general error message
        setError("root", {
          type: "server",
          message: error.message || errorMessages.invalidCredentials,
        });
      } else if (error.code === "INVALID_EMAIL") {
        setError("email", {
          type: "server",
          message: error.message || errorMessages.invalidEmail,
        });
      } else {
        // General error - set on root
        setError("root", {
          type: "server",
          message: error.message || errorMessages.generic,
        });
      }
    }
  }, [signInMutation.error, setError, errorMessages]);

  // Handle resend verification success
  useEffect(() => {
    if (resendVerificationMutation.isSuccess) {
      // Clear any existing errors and show success message
      setError("root", {
        type: "server",
        message: t("resendVerification.success"),
      });
    }
  }, [resendVerificationMutation.isSuccess, setError, t]);

  useEffect(() => {
    if (signInMutation.isSuccess && signInMutation.data) {
      // Redirect to workspace page after successful signin
      // Use router.push() to allow React Query onSuccess callback to execute
      // This ensures queries are properly invalidated and data is refreshed
      router.push("/myworkspace");
    }
  }, [signInMutation.isSuccess, signInMutation.data, router]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    signInMutation.mutate(data);
  };

  const handleResendVerification = async () => {
    const email = getValues("email");
    if (email) {
      resendVerificationMutation.mutate(email);
    }
  };

  // Check if error is email verification related (from mutation or redirect)
  const isEmailVerificationError =
    isUnverifiedRedirect ||
    (signInMutation.error &&
      (signInMutation.error as { code?: string }).code ===
        "EMAIL_VERIFICATION_ERROR");

  return (
    <div className={styles["signin-page"]}>
      <div className={styles["signin-container"]}>
        <h1 className={styles["signin-title"]}>{t("title")}</h1>
        <p className={styles["signin-subtitle"]}>{t("subtitle")}</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles["signin-form"]}
          noValidate
        >
          {errors.root && (
            <div className={styles["signin-error"]} role="alert">
              <p>{errors.root.message}</p>
              {isEmailVerificationError && (
                <div className={styles["signin-resend-verification"]}>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendVerificationMutation.isPending}
                    className={styles["signin-resend-button"]}
                    aria-label={t("resendVerification.buttonAriaLabel")}
                  >
                    {resendVerificationMutation.isPending
                      ? tCommon("loading")
                      : t("resendVerification.button")}
                  </button>
                </div>
              )}
            </div>
          )}

          <Input
            label={tCommon("email")}
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label={tCommon("password")}
            type="password"
            autoComplete="current-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <div className={styles["signin-forgot-password"]}>
            <Link href="/auth/reset-password" className={styles["signin-link"]}>
              {t("forgotPassword")}
            </Link>
          </div>

          <Button
            label={t("button")}
            type="submit"
            fullWidth
            disabled={signInMutation.isPending}
            aria-label={t("buttonAriaLabel")}
            onClick={() => {}}
          />
        </form>

        <p className={styles["signin-footer"]}>
          {t("footer")}{" "}
          <Link href="/auth/signup" className={styles["signin-link"]}>
            {t("footerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SigninPage;
