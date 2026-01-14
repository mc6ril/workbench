"use client";

import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { SignInInput } from "@/core/domain/schema/auth.schema";
import { SignInSchema } from "@/core/domain/schema/auth.schema";

import { Button, Form, Input, Text, Title } from "@/presentation/components/ui";
import { useResendVerification, useSignIn } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import styles from "./SigninPage.module.scss";

type FormData = SignInInput;

const SigninPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signInMutation = useSignIn();
  const resendVerificationMutation = useResendVerification();
  const t = useTranslation("pages.signin");
  const tCommon = useTranslation("common");
  const tErrors = useTranslation("errors");

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

  // Show unverified email error if redirected from middleware
  useEffect(() => {
    if (isUnverifiedRedirect) {
      setError("root", {
        type: "server",
        message: tErrors("auth.EMAIL_VERIFICATION_ERROR"),
      });
    }
  }, [isUnverifiedRedirect, setError, tErrors]);

  useEffect(() => {
    if (signInMutation.error) {
      const error = signInMutation.error as { code?: string };
      const errorMessage = getErrorMessage(error, tErrors);

      // Map domain errors to form fields
      if (error.code === "EMAIL_VERIFICATION_ERROR") {
        // Unverified user trying to sign in
        setError("root", {
          type: "server",
          message: errorMessage,
        });
      } else if (error.code === "INVALID_CREDENTIALS") {
        // Invalid credentials can be either email or password issue
        // Set on root to show general error message
        setError("root", {
          type: "server",
          message: errorMessage,
        });
      } else if (error.code === "INVALID_EMAIL") {
        setError("email", {
          type: "server",
          message: errorMessage,
        });
      } else {
        // General error - set on root
        setError("root", {
          type: "server",
          message: errorMessage,
        });
      }
    }
  }, [signInMutation.error, setError, tErrors]);

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
      router.push("/workspace");
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
        <Title variant="h1" className={styles["signin-title"]}>
          {t("title")}
        </Title>
        <Text variant="body" className={styles["signin-subtitle"]}>
          {t("subtitle")}
        </Text>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          className={styles["signin-form"]}
          error={errors.root?.message}
          noValidate
        >
          {isEmailVerificationError && errors.root && (
            <div className={styles["signin-resend-verification"]}>
              <Button
                label={
                  resendVerificationMutation.isPending
                    ? tCommon("loading")
                    : t("resendVerification.button")
                }
                onClick={handleResendVerification}
                disabled={resendVerificationMutation.isPending}
                variant="secondary"
                type="button"
                aria-label={t("resendVerification.buttonAriaLabel")}
              />
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
        </Form>

        <Text variant="small" className={styles["signin-footer"]}>
          {t("footer")}{" "}
          <Link href="/auth/signup" className={styles["signin-link"]}>
            {t("footerLink")}
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default SigninPage;
