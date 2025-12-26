"use client";

import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { SignUpInput } from "@/core/domain/auth.schema";
import { SignUpSchema } from "@/core/domain/auth.schema";
import { useTranslation } from "@/shared/i18n";

import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import { useSignUp } from "@/presentation/hooks";

import styles from "./SignupPage.module.scss";

type FormData = SignUpInput;

const SignupPage = () => {
  const router = useRouter();
  const signUpMutation = useSignUp();
  const t = useTranslation("pages.signup");
  const tCommon = useTranslation("common");

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
      const error = signUpMutation.error as { message?: string; code?: string };

      // Map domain errors to form fields
      if (
        error.code === "EMAIL_ALREADY_EXISTS" ||
        error.code === "INVALID_EMAIL"
      ) {
        setError("email", {
          type: "server",
          message: error.message || t("errors.invalidEmail"),
        });
      } else if (error.code === "WEAK_PASSWORD") {
        setError("password", {
          type: "server",
          message: error.message || t("errors.weakPassword"),
        });
      } else {
        // General error - set on root
        setError("root", {
          type: "server",
          message: error.message || t("errors.generic"),
        });
      }
    }
  }, [signUpMutation.error, setError]);

  useEffect(() => {
    if (
      signUpMutation.isSuccess &&
      signUpMutation.data?.session &&
      !signUpMutation.data.requiresEmailVerification
    ) {
      // Redirect to signin page after successful signup (only if session exists and email verification is not required)
      router.push("/signin");
    }
  }, [signUpMutation.isSuccess, signUpMutation.data, router]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    signUpMutation.mutate(data);
  };

  return (
    <div className={styles["signup-page"]}>
      <div className={styles["signup-container"]}>
        <h1 className={styles["signup-title"]}>{t("title")}</h1>
        <p className={styles["signup-subtitle"]}>{t("subtitle")}</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles["signup-form"]}
          noValidate
        >
          {errors.root && (
            <div className={styles["signup-error"]} role="alert">
              {errors.root.message}
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
        </form>

        <p className={styles["signup-footer"]}>
          {t("footer")}{" "}
          <Link href="/signin" className={styles["signup-link"]}>
            {t("footerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
