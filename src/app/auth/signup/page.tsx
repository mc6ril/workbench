"use client";

import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { SignUpInput } from "@/core/domain/schema/auth.schema";
import { SignUpSchema } from "@/core/domain/schema/auth.schema";

import { Button, Form, Input, Text, Title } from "@/presentation/components/ui";
import { useSignUp } from "@/presentation/hooks";

import { useTranslation } from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";

import styles from "./SignupPage.module.scss";

type FormData = SignUpInput;

const SignupPage = () => {
  const router = useRouter();
  const signUpMutation = useSignUp();
  const t = useTranslation("pages.signup");
  const tCommon = useTranslation("common");
  const tErrors = useTranslation("errors");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(SignUpSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (signUpMutation.error) {
      const error = signUpMutation.error as { code?: string };
      const errorMessage = getErrorMessage(error, tErrors);

      // Map domain errors to form fields
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
        // General error - set on root
        setError("root", {
          type: "server",
          message: errorMessage,
        });
      }
    }
  }, [signUpMutation.error, setError, tErrors]);

  useEffect(() => {
    if (signUpMutation.isSuccess && signUpMutation.data) {
      // If email verification is required, show message (don't redirect)
      if (signUpMutation.data.requiresEmailVerification) {
        // Stay on page to show verification message
        return;
      }

      // If session exists and email verification is not required, redirect to signin
      if (signUpMutation.data.session) {
        router.push("/auth/signin");
      }
    }
  }, [signUpMutation.isSuccess, signUpMutation.data, router]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    signUpMutation.mutate(data);
  };

  // Show email verification message if verification is required
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
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            label={t("button")}
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
