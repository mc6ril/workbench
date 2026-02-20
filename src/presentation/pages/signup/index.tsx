"use client";

import { useCallback, useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { getNextUnmetCriterion } from "@/core/domain/passwordStrength";
import type {
  SignUpFormInput,
  SignUpInput,
} from "@/core/domain/schema/auth.schema";
import { SignUpFormSchema } from "@/core/domain/schema/auth.schema";

import {
  Button,
  Checkbox,
  Form,
  Input,
  PasswordStrengthIndicator,
  Text,
  Title,
} from "@/presentation/components/ui";
import { useSignUp } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import { translateFieldError } from "@/shared/i18n/zodFieldErrors";

import styles from "./styles.module.scss";

const SignupPage = () => {
  const router = useRouter();
  const signUpMutation = useSignUp();
  const t = useTranslation("pages.signup");
  const tCommon = useTranslation("common");
  const tErrors = useTranslation("errors");
  const tFields = useTranslation("pages.signup.fields");

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
        router.push("/auth/signin");
      }
    }
  }, [signUpMutation.isSuccess, signUpMutation.data, router]);

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
            <Link href="/auth/signin" className={styles["signup-link"]}>
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
                  label=""
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  required
                  aria-label={tFields("acceptedTerms.ariaLabel")}
                />
              )}
            />
            <Text variant="small" className={styles["signup-terms__label"]}>
              {tFields("acceptedTerms.label")}{" "}
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
              {tErrors("auth.termsRequired") || errors.acceptedTerms.message}
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

        <Text variant="small" className={styles["signup-footer"]}>
          {t("footer")}{" "}
          <Link href="/auth/signin" className={styles["signup-link"]}>
            {t("footerLink")}
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default SignupPage;
