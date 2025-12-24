"use client";

import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import type { SignInInput } from "@/core/domain/auth/auth.schema";
import { SignInSchema } from "@/core/domain/auth/auth.schema";
import { useTranslation } from "@/shared/i18n";

import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import { useSignIn } from "@/presentation/hooks/useSignIn";

import styles from "./SigninPage.module.scss";

type FormData = SignInInput;

const SigninPage = () => {
  const router = useRouter();
  const signInMutation = useSignIn();
  const t = useTranslation("pages.signin");
  const tCommon = useTranslation("common");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(SignInSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (signInMutation.error) {
      const error = signInMutation.error as { message?: string; code?: string };

      // Map domain errors to form fields
      if (error.code === "INVALID_CREDENTIALS") {
        // Invalid credentials can be either email or password issue
        // Set on root to show general error message
        setError("root", {
          type: "server",
          message: error.message || t("errors.invalidCredentials"),
        });
      } else if (error.code === "INVALID_EMAIL") {
        setError("email", {
          type: "server",
          message: error.message || t("errors.invalidEmail"),
        });
      } else {
        // General error - set on root
        setError("root", {
          type: "server",
          message: error.message || t("errors.generic"),
        });
      }
    }
  }, [signInMutation.error, setError]);

  useEffect(() => {
    if (signInMutation.isSuccess && signInMutation.data) {
      // Redirect to home page (project overview) after successful signin
      router.push("/");
    }
  }, [signInMutation.isSuccess, signInMutation.data, router]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    signInMutation.mutate(data);
  };

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
            autoComplete="current-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

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
          <Link href="/signup" className={styles["signin-link"]}>
            {t("footerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SigninPage;
