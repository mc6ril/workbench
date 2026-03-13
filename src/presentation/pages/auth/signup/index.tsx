"use client";

import { useCallback, useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { getNextUnmetCriterion } from "@/core/domain/passwordStrength";
import type {
  SignUpFormInput,
  SignUpInput,
} from "@/core/domain/schema/auth.schema";
import { SignUpFormSchema } from "@/core/domain/schema/auth.schema";

import Button from "@/presentation/components/ui/Button";
import Checkbox from "@/presentation/components/ui/Checkbox";
import Form from "@/presentation/components/ui/Form";
import Input from "@/presentation/components/ui/Input";
import PasswordStrengthIndicator from "@/presentation/components/ui/PasswordStrengthIndicator";
import Text from "@/presentation/components/ui/Text";
import Title from "@/presentation/components/ui/Title";
import { useSignInWithGoogle } from "@/presentation/hooks/auth/useSignInWithGoogle";
import { useSignUp } from "@/presentation/hooks/auth/useSignUp";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { translateFieldError } from "@/shared/i18n/zodFieldErrors";

import styles from "./styles.module.scss";

const SignupPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signUpMutation = useSignUp();
  const signInWithGoogleMutation = useSignInWithGoogle();
  const t = useTranslation("pages.signup");
  const tCommon = useTranslation("common");
  const tErrors = useTranslation("errors");
  const tFields = useTranslation("pages.signup.fields");
  const redirectPathParam = searchParams.get("redirect");
  const redirectPath =
    redirectPathParam &&
    redirectPathParam.startsWith("/") &&
    !redirectPathParam.startsWith("//")
      ? redirectPathParam
      : "/workspace";
  const signinHref =
    redirectPath === "/workspace"
      ? "/auth/signin"
      : `/auth/signin?redirect=${encodeURIComponent(redirectPath)}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useForm<SignUpFormInput>({
    resolver: zodResolver(SignUpFormSchema),
    mode: "onBlur",
    defaultValues: {
      acceptedTerms: false as unknown as true,
    },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const nextCriterion = getNextUnmetCriterion(passwordValue);
  const passwordHint = nextCriterion
    ? tFields(`password.hint.${nextCriterion}`)
    : undefined;

  useEffect(() => {
    if (signUpMutation.error) {
      const error = signUpMutation.error as { code?: string };
      const errorMessage = getErrorMessage(error, tErrors);

      if (
        error.code === "EMAIL_ALREADY_EXISTS" ||
        error.code === "INVALID_EMAIL"
      ) {
        setError("email", {
          type: "server",
          message: errorMessage,
        });
      } else if (error.code === "WEAK_PASSWORD") {
        setError("password", {
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
  }, [signUpMutation.error, setError, tErrors]);

  useEffect(() => {
    if (signUpMutation.isSuccess && signUpMutation.data) {
      if (signUpMutation.data.requiresEmailVerification) {
        return;
      }

      if (signUpMutation.data.session) {
        router.push(redirectPath);
      }
    }
  }, [redirectPath, signUpMutation.isSuccess, signUpMutation.data, router]);

  const onSubmit: SubmitHandler<SignUpFormInput> = useCallback(
    (data) => {
      const signUpInput: SignUpInput = {
        email: data.email,
        password: data.password,
        displayName: data.displayName || undefined,
        termsAcceptedAt: new Date().toISOString(),
      };
      signUpMutation.mutate(signUpInput);
    },
    [signUpMutation]
  );

  const handleGoogleSignIn = useCallback(() => {
    signInWithGoogleMutation.mutate(redirectPath);
  }, [redirectPath, signInWithGoogleMutation]);

  if (
    signUpMutation.isSuccess &&
    signUpMutation.data?.requiresEmailVerification
  ) {
    return (
      <div className={styles["signup-page"]}>
        <div className={styles["signup-container"]}>
          <Title variant="h1" className={styles["signup-title"]}>
            {t("verification.title")}
          </Title>
          <Text variant="body" className={styles["signup-subtitle"]}>
            {t("verification.message")}
          </Text>
          <Text variant="body" className={styles["signup-subtitle"]}>
            {t("verification.instructions")}
          </Text>
          <div className={styles["signup-footer"]}>
            <Link href={signinHref} className={styles["signup-link"]}>
              {t("verification.backToSignin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["signup-page"]}>
      <div className={styles["signup-container"]}>
        <Title variant="h1" className={styles["signup-title"]}>
          {t("title")}
        </Title>
        <Text variant="body" className={styles["signup-subtitle"]}>
          {t("subtitle")}
        </Text>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          className={styles["signup-form"]}
          error={errors.root?.message}
          noValidate
        >
          <Input
            label={tFields("displayName.label")}
            type="text"
            autoComplete="name"
            placeholder={tFields("displayName.placeholder")}
            error={errors.displayName?.message}
            {...register("displayName")}
          />

          <Input
            label={tCommon("email")}
            type="email"
            autoComplete="email"
            required
            error={translateFieldError(errors.email, tFields)}
            {...register("email")}
          />

          <div className={styles["signup-password-group"]}>
            <Input
              label={tCommon("password")}
              type="password"
              autoComplete="new-password"
              required
              helperText={passwordHint}
              error={translateFieldError(errors.password, tFields)}
              {...register("password")}
            />
            <PasswordStrengthIndicator password={passwordValue} />
          </div>

          <Input
            label={tFields("confirmPassword.label")}
            type="password"
            autoComplete="new-password"
            required
            error={translateFieldError(errors.confirmPassword, tFields)}
            {...register("confirmPassword")}
          />

          <div className={styles["signup-terms"]}>
            <Controller
              name="acceptedTerms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label={tFields("acceptedTerms.label")}
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  required
                  aria-label={tFields("acceptedTerms.ariaLabel")}
                />
              )}
            />
            <Text variant="small" className={styles["signup-terms__label"]}>
              <Link href="/legal" className={styles["signup-terms__link"]}>
                {tFields("acceptedTerms.linkLabel")}
              </Link>
            </Text>
          </div>
          {errors.acceptedTerms && (
            <div
              className={styles["signup-terms__error"]}
              role="alert"
              aria-live="assertive"
            >
              {t("errors.termsRequired") || errors.acceptedTerms.message}
            </div>
          )}

          <Button
            label={signUpMutation.isPending ? t("buttonLoading") : t("button")}
            type="submit"
            fullWidth
            disabled={signUpMutation.isPending}
            aria-label={t("buttonAriaLabel")}
            onClick={() => {}}
          />
        </Form>

        <div className={styles["signup-divider"]}>
          <span>{t("oauth.divider")}</span>
        </div>
        <Button
          label={t("oauth.googleButton")}
          variant="secondary"
          fullWidth
          onClick={handleGoogleSignIn}
          disabled={signInWithGoogleMutation.isPending}
          aria-label={t("oauth.googleButtonAriaLabel")}
        />

        <Text variant="small" className={styles["signup-footer"]}>
          {t("footer")}{" "}
          <Link href={signinHref} className={styles["signup-link"]}>
            {t("footerLink")}
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default SignupPage;
