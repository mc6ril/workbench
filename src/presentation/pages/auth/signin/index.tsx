"use client";

import { useCallback, useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { SignInInput } from "@/core/domain/schema/auth.schema";
import { SignInSchema } from "@/core/domain/schema/auth.schema";

import Button from "@/presentation/components/ui/Button";
import Form from "@/presentation/components/ui/Form";
import Input from "@/presentation/components/ui/Input";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";
import { useResendVerification } from "@/presentation/hooks/auth/useResendVerification";
import { useSignIn } from "@/presentation/hooks/auth/useSignIn";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { translateFieldError } from "@/shared/i18n/zodFieldErrors";

import styles from "./styles.module.scss";

type FormData = SignInInput;

const SigninPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signInMutation = useSignIn();
  const resendVerificationMutation = useResendVerification();
  const t = useTranslation("pages.signin");
  const tCommon = useTranslation("common");
  const tErrors = useTranslation("errors");
  const tFields = useTranslation("pages.signin.fields");

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

      if (error.code === "EMAIL_VERIFICATION_ERROR") {
        setError("root", {
          type: "server",
          message: errorMessage,
        });
      } else if (error.code === "INVALID_CREDENTIALS") {
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
        setError("root", {
          type: "server",
          message: errorMessage,
        });
      }
    }
  }, [signInMutation.error, setError, tErrors]);

  useEffect(() => {
    if (resendVerificationMutation.isSuccess) {
      setError("root", {
        type: "server",
        message: t("resendVerification.success"),
      });
    }
  }, [resendVerificationMutation.isSuccess, setError, t]);

  useEffect(() => {
    if (signInMutation.isSuccess && signInMutation.data) {
      router.push("/workspace");
    }
  }, [signInMutation.isSuccess, signInMutation.data, router]);

  const onSubmit: SubmitHandler<FormData> = useCallback(
    (data) => {
      signInMutation.mutate(data);
    },
    [signInMutation]
  );

  const handleResendVerification = useCallback(() => {
    const email = getValues("email");
    if (email) {
      resendVerificationMutation.mutate(email);
    }
  }, [getValues, resendVerificationMutation]);

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
            error={translateFieldError(errors.email, tFields)}
            {...register("email")}
          />

          <Input
            label={tCommon("password")}
            type="password"
            autoComplete="current-password"
            required
            error={translateFieldError(errors.password, tFields)}
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
